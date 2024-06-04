import icons from '@/assets/icons';
import styles from './styles.module.scss';

export default function Welcome() {
  return (
    <div className={styles.welcomePage}>
      <img src={icons.BkPhoto} alt="" />
    </div>
  );
}
