import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserXP {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

export interface UserAchievement {
  achievement_id: string;
  earned_at: string;
}

const LEVEL_NAMES = [
  "Novice", "Apprentice", "Coder", "Developer", "Engineer",
  "Specialist", "Expert", "Master", "Grandmaster", "Architect"
];

export const getLevelName = (level: number) => LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] || "Architect";
export const getXPForLevel = (level: number) => level * 500;
export const getXPProgress = (xp: number, level: number) => {
  const currentLevelXP = (level - 1) * 500;
  const nextLevelXP = level * 500;
  return Math.round(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
};

export function useGamification() {
  const { user } = useAuth();
  const [xp, setXP] = useState<UserXP | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const fetch = async () => {
      setLoading(true);
      const [xpRes, achRes, earnedRes] = await Promise.all([
        supabase.from("user_xp").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("achievements").select("*").order("xp_reward"),
        supabase.from("user_achievements").select("*").eq("user_id", user.id),
      ]);
      setXP(xpRes.data as UserXP | null);
      setAchievements((achRes.data as Achievement[]) ?? []);
      setEarnedAchievements((earnedRes.data as UserAchievement[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const addXP = useCallback(async (amount: number) => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    if (xp) {
      const lastDate = xp.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      const newStreak = lastDate === yesterdayStr ? xp.current_streak + 1 : lastDate === today ? xp.current_streak : 1;
      const newXP = xp.total_xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;

      await supabase.from("user_xp").update({
        total_xp: newXP,
        level: newLevel,
        current_streak: newStreak,
        longest_streak: Math.max(xp.longest_streak, newStreak),
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user.id);

      setXP({ ...xp, total_xp: newXP, level: newLevel, current_streak: newStreak, longest_streak: Math.max(xp.longest_streak, newStreak), last_activity_date: today });
    } else {
      await supabase.from("user_xp").insert({
        user_id: user.id,
        total_xp: amount,
        level: 1,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });
      setXP({ total_xp: amount, level: 1, current_streak: 1, longest_streak: 1, last_activity_date: today });
    }
  }, [user, xp]);

  const checkAndAwardAchievement = useCallback(async (achievementId: string) => {
    if (!user || earnedAchievements.find(a => a.achievement_id === achievementId)) return false;
    
    const { error } = await supabase.from("user_achievements").insert({
      user_id: user.id,
      achievement_id: achievementId,
    });
    
    if (!error) {
      setEarnedAchievements(prev => [...prev, { achievement_id: achievementId, earned_at: new Date().toISOString() }]);
      const ach = achievements.find(a => a.id === achievementId);
      if (ach) await addXP(ach.xp_reward);
      return true;
    }
    return false;
  }, [user, earnedAchievements, achievements, addXP]);

  return {
    xp, achievements, earnedAchievements, loading,
    addXP, checkAndAwardAchievement,
  };
}
