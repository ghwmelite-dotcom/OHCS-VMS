import useConfetti from './useConfetti';
import useSound from './useSound';
import toast from 'react-hot-toast';

/**
 * Composite hook combining confetti + sound + toast for UX celebrations.
 *
 * Usage:
 *   const { celebrate, notify, play } = useUXFeedback();
 *   celebrate('checkin', 'John Doe checked in!');       // confetti + sound + toast
 *   celebrate('checkout', 'Checked out', 'subtle');     // subtle confetti + sound + toast
 *   notify.success('Saved!');                           // toast only
 *   play('success');                                    // sound only
 */
export default function useUXFeedback() {
  const { fire } = useConfetti();
  const { play, getEnabled, setEnabled } = useSound();

  const celebrate = (soundName, message, confettiType = 'celebration') => {
    play(soundName);
    fire(confettiType);
    if (message) toast.success(message);
  };

  const notify = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast(msg, { icon: '\u2139\uFE0F' }),
  };

  return { celebrate, notify, play, fire, soundEnabled: getEnabled, setSoundEnabled: setEnabled };
}
