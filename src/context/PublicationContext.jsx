// src/context/PublicationContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react"
import { publicationService } from "../services/publicationService";
import { useAuth } from "../hooks/useAuth";

const PublicationContext = createContext(null)

const PublicationProvider = ({ children }) => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await publicationService.getPublications();
        setPublications(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const addPublication = async (newPub) => {
    try {
      const added = await publicationService.addPublication(newPub);
      setPublications((prev) => [added, ...prev]);
      setError(null);
      return added;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editPublication = async (updatedPub) => {
    try {
      const updated = await publicationService.updatePublication(updatedPub);
      setPublications(prev => prev.map(pub => pub.id === updated.id ? updated : pub));
      setError(null);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePublication = async (id) => {
    try {
      await publicationService.deletePublication(id);
      // Langsung update state tanpa menunggu response
      setPublications(prev => prev.filter(pub => pub.id !== id));
      setError(null);
      return true;
    } catch (err) {
      // Jika error tapi data sudah terhapus, tetap update state
      if (err.message.includes('No query results for model')) {
        setPublications(prev => prev.filter(pub => pub.id !== id));
        setError(null);
        return true;
      }
      setError(err.message);
      throw err;
    }
  };

  return (
    <PublicationContext.Provider
      value={{
        publications,
        loading,
        error,
        addPublication,
        editPublication,
        deletePublication,
        setPublications
      }}
    >
      {children}
    </PublicationContext.Provider>
  );
};

export const usePublicationContext = () => useContext(PublicationContext)
export { PublicationContext, PublicationProvider }