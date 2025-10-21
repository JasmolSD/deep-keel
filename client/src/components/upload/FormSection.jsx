// components/upload/FormSection.jsx
const FormSection = ({ title, description, children }) => (
    <div className="form-section">
        <h3>{title}</h3>
        {description && <p className="section-description">{description}</p>}
        <div className="form-grid">{children}</div>
    </div>
);

export default FormSection;