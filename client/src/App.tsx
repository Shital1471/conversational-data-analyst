import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { ChatMessage } from './components/ChatMessage.js';
import { ChatInput } from './components/ChatInput.js';
import { EmptyState } from './components/EmptyState.js';
import { SmartFilterBar, type FilterState } from './components/SmartFilterBar.js';
import { DashboardView } from './components/DashboardView.js';
import { askQuestion, fetchDatabaseOverview, checkHealth } from './services/api.js';
import type { Message, DatabaseOverview } from './types/index.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ToastProvider, useToast } from './components/Toast.js';

function MainApp() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const [overview, setOverview] = useState<DatabaseOverview | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'dashboard'>('chat');

  const [filters, setFilters] = useState<FilterState>({
    segment: 'All Segments',
    region: 'All Regions',
    metricFocus: 'All Metrics',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeView === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, activeView]);

  // Initial telemetry load
  useEffect(() => {
    const initData = async () => {
      try {
        const health = await checkHealth();
        setDbConnected(health.status === 'healthy');

        const dbOverview = await fetchDatabaseOverview();
        setOverview(dbOverview);
      } catch (err) {
        console.warn('Backend not yet reachable on startup:', err);
        setDbConnected(false);
      }
    };

    initData();
  }, []);

  const handleSendMessage = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    // Automatically switch to chat view when a query is submitted
    if (activeView !== 'chat') {
      setActiveView('chat');
    }

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message & loading placeholder
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: timeStr,
        text: questionText,
      },
      {
        id: assistantMsgId,
        sender: 'assistant',
        timestamp: timeStr,
        text: questionText,
        isLoading: true,
      },
    ]);

    setIsLoading(true);

    try {
      const response = await askQuestion(questionText);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isLoading: false,
                response,
              }
            : m
        )
      );

      // Refresh overview telemetry in the background
      fetchDatabaseOverview().then(setOverview).catch(() => {});
    } catch (error: unknown) {
      const err = error as Error;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isLoading: false,
                isError: true,
                errorDetails: err.message || 'Failed to communicate with analytical server.',
              }
            : m
        )
      );
      showToast('Error querying database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    showToast('Conversation cleared', 'info');
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (newFilters.segment !== 'All Segments' || newFilters.region !== 'All Regions') {
      showToast(`Filter applied: ${newFilters.segment} • ${newFilters.region}`, 'info');
    }
  };

  const defaultQuickPrompts = [
    'Show monthly onboarding applications by customer segment',
    'Which branches have the highest rejection rate?',
    'Show the top five customers by transaction value',
    'What is the total transaction value this month?',
    'Compare retail and SME onboarding volumes',
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#080c15] text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Sidebar with database overview & prompt library */}
      <Sidebar
        overview={overview}
        onSelectPrompt={handleSendMessage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          dbConnected={dbConnected}
          activeView={activeView}
          onViewChange={setActiveView}
          onReset={handleReset}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Smart Filters Bar */}
        <SmartFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onApplyPrompt={handleSendMessage}
        />

        {/* View Switcher: Chat or Executive Dashboard */}
        {activeView === 'dashboard' ? (
          <DashboardView
            overview={overview}
            onSelectPrompt={handleSendMessage}
            onSwitchToChat={() => setActiveView('chat')}
          />
        ) : (
          <>
            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
              {messages.length === 0 ? (
                <EmptyState onSelectPrompt={handleSendMessage} />
              ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onSelectPrompt={handleSendMessage}
                      onRetry={handleSendMessage}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              quickPrompts={messages.length > 0 ? defaultQuickPrompts : undefined}
              onSelectPrompt={handleSendMessage}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
