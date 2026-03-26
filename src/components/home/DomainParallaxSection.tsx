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
import vlsiImg from "@/assets/domains/vlsi.jpg";
import powerSystemsImg from "@/assets/domains/power-systems.jpg";
import signalProcessingImg from "@/assets/domains/signal-processing.jpg";
import roboticsImg from "@/assets/domains/robotics.jpg";
import howItWorksImg from "@/assets/sections/how-it-works.jpg";
import aiPowerImg from "@/assets/sections/ai-power.jpg";
import studentSuccessImg from "@/assets/sections/student-success.jpg";

const domainProducts = [
  { title: "Web Development", link: "/domain/web-development", thumbnail: webDevImg },
  { title: "App Development", link: "/domain/app-development", thumbnail: appDevImg },
  { title: "Cybersecurity", link: "/domain/cybersecurity", thumbnail: cybersecurityImg },
  { title: "Data Science & ML", link: "/domain/data-science", thumbnail: dataScienceImg },
  { title: "Cloud Computing", link: "/domain/cloud-computing", thumbnail: cloudImg },
  { title: "DevOps", link: "/domain/devops", thumbnail: devopsImg },
  { title: "Database Engineering", link: "/domain/database", thumbnail: databaseImg },
  { title: "IoT & Embedded", link: "/domain/iot", thumbnail: iotImg },
  { title: "Blockchain", link: "/domain/blockchain", thumbnail: blockchainImg },
  { title: "UI/UX Design", link: "/domain/ui-ux", thumbnail: uiuxImg },
  { title: "DSA", link: "/domain/dsa", thumbnail: dsaImg },
  { title: "System Design", link: "/domain/system-design", thumbnail: systemDesignImg },
  { title: "VLSI Design", link: "/domain/vlsi", thumbnail: vlsiImg },
  { title: "Power Systems", link: "/domain/power-systems", thumbnail: powerSystemsImg },
  { title: "Signals & Systems", link: "/domain/signal-processing", thumbnail: signalProcessingImg },
  { title: "Robotics & Automation", link: "/domain/robotics", thumbnail: roboticsImg },
  { title: "AI-Powered Learning", link: "/domains", thumbnail: aiPowerImg },
  { title: "Guided Roadmaps", link: "/domains", thumbnail: howItWorksImg },
  { title: "Student Success", link: "/about", thumbnail: studentSuccessImg },
];

const DomainParallaxSection = () => {
  return <HeroParallax products={domainProducts} />;
};

export default DomainParallaxSection;
