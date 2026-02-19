import { HeroParallax } from "@/components/ui/hero-parallax";

import webDevImg from "@/assets/domains/web-development.jpg";
import appDevImg from "@/assets/domains/app-development.jpg";
import cybersecurityImg from "@/assets/domains/cybersecurity.jpg";
import dataScienceImg from "@/assets/domains/data-science.jpg";
import cloudImg from "@/assets/domains/cloud-computing.jpg";
import devopsImg from "@/assets/domains/devops.jpg";
import databaseImg from "@/assets/domains/database.jpg";
import iotImg from "@/assets/domains/iot.jpg";
import blockchainImg from "@/assets/domains/blockchain.jpg";
import uiuxImg from "@/assets/domains/ui-ux.jpg";
import dsaImg from "@/assets/domains/dsa.jpg";
import systemDesignImg from "@/assets/domains/system-design.jpg";
import howItWorksImg from "@/assets/sections/how-it-works.jpg";
import aiPowerImg from "@/assets/sections/ai-power.jpg";
import studentSuccessImg from "@/assets/sections/student-success.jpg";

const domainProducts = [
  { title: "Web Development", link: "/domains/web-development", thumbnail: webDevImg },
  { title: "App Development", link: "/domains/app-development", thumbnail: appDevImg },
  { title: "Cybersecurity", link: "/domains/cybersecurity", thumbnail: cybersecurityImg },
  { title: "Data Science & ML", link: "/domains/data-science", thumbnail: dataScienceImg },
  { title: "Cloud Computing", link: "/domains/cloud-computing", thumbnail: cloudImg },
  { title: "DevOps", link: "/domains/devops", thumbnail: devopsImg },
  { title: "Database Engineering", link: "/domains/database", thumbnail: databaseImg },
  { title: "IoT & Embedded", link: "/domains/iot", thumbnail: iotImg },
  { title: "Blockchain", link: "/domains/blockchain", thumbnail: blockchainImg },
  { title: "UI/UX Design", link: "/domains/ui-ux", thumbnail: uiuxImg },
  { title: "DSA", link: "/domains/dsa", thumbnail: dsaImg },
  { title: "System Design", link: "/domains/system-design", thumbnail: systemDesignImg },
  { title: "AI-Powered Learning", link: "/domains", thumbnail: aiPowerImg },
  { title: "Guided Roadmaps", link: "/domains", thumbnail: howItWorksImg },
  { title: "Student Success", link: "/about", thumbnail: studentSuccessImg },
];

const DomainParallaxSection = () => {
  return <HeroParallax products={domainProducts} />;
};

export default DomainParallaxSection;
