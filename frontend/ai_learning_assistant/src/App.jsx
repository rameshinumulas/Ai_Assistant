import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DocumentListPage from './pages/documents/DocumentListPage';
import DocumentDetailsPage from './pages/documents/DocumentDetailsPage';
import FlashCardListPage from './pages/FlashCards/FlashCardPage';
import FlashCardPage from './pages/FlashCards/FlashCardPage';
import QuizTakePage from './pages/Quizzes/QuizTakePage';
import QuizeResultPage from './pages/Quizzes/QuizeResultPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {

  const isAuthenticated = false;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route
          path='/'
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ** Protected Routes ** */}
        <Route element={<ProtectedRoute />}>
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/documents' element={<DocumentListPage />} />
          <Route path='/document/:id' element={<DocumentDetailsPage />} />
          <Route path='/flashcards' element={<FlashCardListPage />} />
          <Route path='/documents/:id/flashcards' element={<FlashCardPage />} />
          <Route path='/quizzes/:quizId' element={<QuizTakePage />} />
          <Route path='/quizzes/:quizId/results' element={<QuizeResultPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )

}
