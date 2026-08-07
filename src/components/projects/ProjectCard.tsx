import { Users, Code2, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface TeamProject {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  domain_id: string;
  tech_stack: string[];
  max_members: number;
  status: string;
  difficulty: string;
  created_at: string;
  member_count?: number;
}

interface ProjectCardProps {
  project: TeamProject;
  ownerName: string;
  onView: (id: string) => void;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusColors: Record<string, string> = {
  recruiting: "bg-primary/10 text-primary border-primary/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
};

const ProjectCard = ({ project, ownerName, onView }: ProjectCardProps) => (
  <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onView(project.id)}>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">by {ownerName}</p>
        </div>
        <div className="flex gap-1.5">
          <Badge variant="outline" className={statusColors[project.status] || ""}>
            {project.status}
          </Badge>
          <Badge variant="outline" className={difficultyColors[project.difficulty] || ""}>
            {project.difficulty}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.tech_stack?.slice(0, 4).map((t) => (
          <Badge key={t} variant="secondary" className="text-[10px]">
            <Code2 className="h-2.5 w-2.5 mr-1" />
            {t}
          </Badge>
        ))}
        {(project.tech_stack?.length || 0) > 4 && (
          <Badge variant="secondary" className="text-[10px]">+{project.tech_stack.length - 4}</Badge>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {project.member_count || 1}/{project.max_members}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(project.created_at), "MMM d")}
          </span>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
          View <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default ProjectCard;
