import { motion } from 'framer-motion';
import { spring } from '../../constants/motion';

export default function MotionButton({ children, className = '', style = {}, onClick, disabled, type = 'button', title, ...props }) {
  return (
    <motion.button
      type={type}
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={spring.snappy}
      {...props}
    >
      {children}
    </motion.button>
  );
}
