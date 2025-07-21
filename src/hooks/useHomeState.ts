import { useState } from 'react';

export function useHomeState() {
  const [chatIsOpen, setChatIsOpen] = useState(false);
  const [showSocialChat, setShowSocialChat] = useState(false);
  const [sosChatIsOpen, setSosChatIsOpen] = useState(false);
  const [expertMatchingIsOpen, setExpertMatchingIsOpen] = useState(false);
  const [expertSearchIsOpen, setExpertSearchIsOpen] = useState(false);
  const [contactRequestIsOpen, setContactRequestIsOpen] = useState(false);
  const [sosSystemIsOpen, setSosSystemIsOpen] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

  return {
    chatIsOpen, setChatIsOpen,
    showSocialChat, setShowSocialChat,
    sosChatIsOpen, setSosChatIsOpen,
    expertMatchingIsOpen, setExpertMatchingIsOpen,
    expertSearchIsOpen, setExpertSearchIsOpen,
    contactRequestIsOpen, setContactRequestIsOpen,
    sosSystemIsOpen, setSosSystemIsOpen,
    isDebugPanelOpen, setIsDebugPanelOpen
  };
}