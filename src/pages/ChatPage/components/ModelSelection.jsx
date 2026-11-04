import styles from "./ModelSelection.module.css";

export function ModelSelection({ options }) {
  return (
    <select className={styles.modelSelection}>
      {options.map((option) => {
        return <option value={option}>{option}</option>;
      })}
    </select>
  );
}
