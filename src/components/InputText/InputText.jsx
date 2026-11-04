import styles from "./InputText.module.css";

export function InputText({ ...props }) {
  return (
    <input {...props} className={styles.inputText} type="text" />
  );
}
