const ManagerDropdown = ({ managers = [], managerId, setManagerId }) => {
  const mgrList = Array.isArray(managers) ? managers : [];
  
  return (
    <select value={managerId} onChange={(e) => setManagerId(e.target.value)} required>
      <option value="">Select Manager</option>
      {mgrList.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
};

export default ManagerDropdown;