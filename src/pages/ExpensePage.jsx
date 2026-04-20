import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, doc, getDoc, addDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

export default function ExpensePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Budget limit state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [numericBudget, setNumericBudget] = useState(0);

  // New Expense form state
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      const docRef = doc(db, "trips", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTrip(data);
        setNumericBudget(data.numericBudget || 1000);
      } else {
        navigate("/home");
      }
    }
    fetchTrip();

    const q = query(collection(db, "trips", id, "expenses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setExpenses(expData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleUpdateBudget = async () => {
    setIsEditingBudget(false);
    await updateDoc(doc(db, "trips", id), { numericBudget });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;
    setAdding(true);
    try {
      await addDoc(collection(db, "trips", id, "expenses"), {
        amount: Number(amount),
        category,
        description,
        day: Number(day),
        createdAt: serverTimestamp()
      });
      setAmount("");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    } finally {
      setAdding(false);
    }
  };

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const progress = Math.min((totalSpent / numericBudget) * 100, 100);
  const isOverBudget = totalSpent > numericBudget;

  const categories = ["Food", "Transport", "Accommodation", "Activity", "Other"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 relative font-sans selection:bg-white/30">
      
      <div className="max-w-5xl mx-auto px-6 pt-16 relative z-10">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-6">
          <div>
            <button onClick={() => navigate(`/trip/${id}`)} className="text-white/50 hover:text-white mb-6 text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
              ← Back to Itinerary
            </button>
            <h1 className="text-5xl font-light text-white tracking-wide mb-2">Expenses</h1>
            <p className="text-white/60 font-light tracking-wider uppercase text-sm">{trip.destinationName}</p>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          {/* Budget Progress Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Spent</p>
                <h2 className="text-5xl font-light text-white">${totalSpent.toFixed(2)}</h2>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Limit</p>
                {isEditingBudget ? (
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={numericBudget} 
                      onChange={(e) => setNumericBudget(Number(e.target.value))}
                      className="w-24 bg-transparent text-white border-b border-white/50 px-1 py-1 text-2xl font-light outline-none"
                    />
                    <button onClick={handleUpdateBudget} className="text-white/50 hover:text-white text-lg">✓</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 justify-end group">
                    <h2 className="text-3xl font-light text-white/80">${numericBudget}</h2>
                    <button onClick={() => setIsEditingBudget(true)} className="text-white/0 group-hover:text-white/50 hover:!text-white text-sm transition-colors">✎</button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-white'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {isOverBudget && <p className="text-red-400 text-xs mt-4 tracking-wider uppercase">⚠️ Budget Exceeded</p>}
          </div>

          {/* Add Expense Form */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <h3 className="text-white/80 font-light text-xl mb-6 tracking-wide">New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount ($)" required
                    className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white outline-none focus:border-white transition-colors font-light placeholder:text-white/30" />
                </div>
                <div className="flex-1">
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white outline-none focus:border-white transition-colors font-light appearance-none">
                    {categories.map(c => <option key={c} value={c} className="bg-[#0a0a0a] text-white">{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-[2]">
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required
                    className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white outline-none focus:border-white transition-colors font-light placeholder:text-white/30" />
                </div>
                <div className="flex-1">
                  <input type="number" min="1" max={trip.duration} value={day} onChange={(e) => setDay(e.target.value)} placeholder="Day" required
                    className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white outline-none focus:border-white transition-colors font-light placeholder:text-white/30" title="Day Number" />
                </div>
              </div>
              <button disabled={adding} type="submit" className="w-full border border-white text-white hover:bg-white hover:text-black uppercase tracking-widest text-xs font-bold py-4 rounded transition-all duration-300">
                {adding ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>
        </div>

        {/* Expenses List */}
        <h3 className="text-xl font-light text-white mb-8 tracking-wide">Recent Transactions</h3>
        {expenses.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-2xl">
            <p className="text-white/40 font-light">No expenses tracked yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map(exp => (
              <div key={exp.id} className="flex items-center justify-between bg-transparent border-b border-white/5 py-4 hover:bg-white/[0.02] transition-colors px-4 -mx-4 rounded">
                <div className="flex flex-col">
                  <h4 className="text-white font-light text-lg mb-1">{exp.description}</h4>
                  <p className="text-white/40 text-xs uppercase tracking-wider">Day {exp.day} <span className="mx-2">•</span> {exp.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-xl">${exp.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}