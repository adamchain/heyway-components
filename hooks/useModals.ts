import { useState } from 'react';

export const useModals = () => {
  const [showScheduler, setShowScheduler] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showNewCallModal, setShowNewCallModal] = useState(false);
  const [showPromptCards, setShowPromptCards] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showCallerIdSetup, setShowCallerIdSetup] = useState(false);
  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [showContactResults, setShowContactResults] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);

  const closeAllModals = () => {
    setShowScheduler(false);
    setShowTranscript(false);
    setShowCallHistory(false);
    setShowNewCallModal(false);
    setShowPromptCards(false);
    setShowContactsModal(false);
    setShowCallerIdSetup(false);
    setShowPlacesModal(false);
    setShowContactResults(false);
    setShowFavoritesModal(false);
  };

  return {
    showScheduler,
    showTranscript,
    showCallHistory,
    showNewCallModal,
    showPromptCards,
    showContactsModal,
    showCallerIdSetup,
    showPlacesModal,
    showContactResults,
    showFavoritesModal,
    setShowScheduler,
    setShowTranscript,
    setShowCallHistory,
    setShowNewCallModal,
    setShowPromptCards,
    setShowContactsModal,
    setShowCallerIdSetup,
    setShowPlacesModal,
    setShowContactResults,
    setShowFavoritesModal,
    closeAllModals,
  };
};