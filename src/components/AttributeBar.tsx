interface Props {
  label: string;
  value: number;
}

export const AttributeBar = ({ label, value }: Props) => (
  <div className="attribute">
    <div className="attribute__meta">
      <span>{label}</span>
      <strong>{value}/100</strong>
    </div>
    <div className="bar"><span style={{ width: `${value}%` }} /></div>
  </div>
);
