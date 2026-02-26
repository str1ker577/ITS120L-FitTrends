import { motion } from "framer-motion";

export default function AnimatedLogo({ animationStage }) {

  if (animationStage === "hidden") return null;

  const isMovingOrForm = animationStage === "moving" || animationStage === "form";

  return (
    <motion.div
      className="logo-container"
      initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%", top: "50%", left: "50%", position: "absolute" }}
      animate={{
        scale: isMovingOrForm ? 1 : 1.5,
        opacity: 1,
        left: isMovingOrForm ? "0px" : "50%",
        top: isMovingOrForm ? "0px" : "50%",
        x: isMovingOrForm ? "0%" : "-50%",
        y: isMovingOrForm ? "0%" : "-50%",
        position: animationStage === "form" ? "static" : "absolute"
      }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <img src="./pics/LOGO.png" alt="WYS Logo" className="logo-image" />
      <span className="logo-text">FitTrends</span>
    </motion.div>
  );
}
