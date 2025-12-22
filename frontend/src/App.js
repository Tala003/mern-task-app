import { useEffect, useState } from "react";
import axios from "axios";

// API Base URL - Ingress use karne ka faida ye hai ke hum direct paths use kar sakte hain
const API_BASE = "/api"; 

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [user, setUser] = useState(null); // Auth State
  const [isLogin, setIsLogin] = useState(true); // Toggle Login/Signup
  const [formData, setFormData] = useState({ email: "", password: "" });

  // 1. Auth Logic (Signup/Login)
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;
    try {
      const res = await axios.post(endpoint, formData);
      setUser(res.data.user); // Assuming backend returns user object
      alert(`${isLogin ? "Login" : "Signup"} Successful!`);
    } catch (err) {
      alert("Auth Error: Check backend connectivity");
    }
  };

  // 2. Task Logic
  const loadTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks`);
      setTasks(res.data);
    } catch (err) {
      console.error("Error loading tasks", err);
    }
  };

  const addTask = async () => {
    if (!title) return;
    await axios.post(`${API_BASE}/tasks`, { title });
    setTitle("");
    loadTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
    loadTasks();
  };

  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  // UI - Login/Signup View
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.header}>{isLogin ? "Login" : "Sign Up"}</h2>
          <form onSubmit={handleAuth} style={styles.form}>
            <input 
              placeholder="Email" 
              style={styles.input} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              style={styles.input} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
            <button type="submit" style={styles.button}>
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          <p onClick={() => setIsLogin(!isLogin)} style={styles.toggle}>
            {isLogin ? "Need an account? Signup" : "Already have an account? Login"}
          </p>
        </div>
      </div>
    );
  }

  // UI - Task Manager View
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
            <h2 style={styles.header}>Task Manager</h2>
            <button onClick={() => setUser(null)} style={styles.logoutBtn}>Logout</button>
        </div>
        <div style={styles.inputGroup}>
          <input 
            value={title} 
            placeholder="What needs to be done?" 
            style={styles.taskInput} 
            onChange={e => setTitle(e.target.value)} 
          />
          <button onClick={addTask} style={styles.addBtn}>Add</button>
        </div>

        <div style={styles.taskList}>
          {tasks.map(t => (
            <div key={t._id} style={styles.taskItem}>
              <span>{t.title}</span>
              <button onClick={() => deleteTask(t._id)} style={styles.delBtn}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Inline CSS for better UI
const styles = {
  container: { backgroundColor: "#f4f7f6", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Arial" },
  card: { backgroundColor: "white", padding: "2rem", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "350px" },
  header: { textAlign: "center", color: "#333", marginBottom: "1.5rem" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "5px", border: "1px solid #ddd" },
  button: { padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  toggle: { textAlign: "center", fontSize: "12px", color: "#007bff", cursor: "pointer", marginTop: "10px" },
  inputGroup: { display: "flex", gap: "5px", marginBottom: "20px" },
  taskInput: { flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ddd" },
  addBtn: { padding: "8px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px" },
  taskItem: { display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #eee", alignItems: "center" },
  delBtn: { backgroundColor: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", fontSize: "12px" },
  logoutBtn: { border: 'none', background: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px'}
};

export default App;