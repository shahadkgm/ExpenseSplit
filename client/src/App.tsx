import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { ExpenseSplitPage } from './pages/ExpenseSplitPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateGroupModal } from './components/CreateGroupModal';
import { LoginPage } from './components/LoginPage';
import { groupService } from './services/group.service';
import { authService, IAuthUser } from './services/auth.service';
import { IGroup } from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<IAuthUser | null>(() =>
    authService.getCurrentUser()
  );
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<IGroup | null>(null);
  const [currentTab, setCurrentTab] = useState<'expenses' | 'dashboard'>('expenses');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchGroups();
    }
  }, [currentUser]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroups();
      setGroups(data);

      if (data.length > 0) {
        if (!activeGroup || !data.some((g) => g._id === activeGroup._id)) {
          setActiveGroup(data[0]);
        } else {
          const updated = data.find((g) => g._id === activeGroup._id);
          if (updated) setActiveGroup(updated);
        }
      } else {
        // If no group exists, auto seed default group
        await createDefaultGroup();
      }
    } catch (err: any) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultGroup = async () => {
    try {
      const defaultGroup = await groupService.createGroup({
        name: 'Goa Trip 🏖️',
        currency: 'INR',
        members: [
          { name: 'Alice' },
          { name: 'Bob' },
          { name: 'Charlie' },
          { name: 'Diana' },
        ],
      });
      setGroups([defaultGroup]);
      setActiveGroup(defaultGroup);
    } catch (err) {
      console.error('Failed to create default group:', err);
    }
  };

  const handleGroupCreated = (newGroup: IGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setActiveGroup(newGroup);
    setCurrentTab('expenses');
  };

  const handleUpdateGroup = (updated: IGroup) => {
    setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
    if (activeGroup?._id === updated._id) {
      setActiveGroup(updated);
    }
  };

  const handleDeleteGroup = (deletedId: string) => {
    const remaining = groups.filter((g) => g._id !== deletedId);
    setGroups(remaining);

    if (remaining.length > 0) {
      setActiveGroup(remaining[0]);
    } else {
      setActiveGroup(null);
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    toast.success('Signed out successfully');
  };

  // If user is not authenticated, show the Login Page (user: shahad, pass: najad)
  if (!currentUser) {
    return (
      <>
        <Toaster position="top-right" reverseOrder={false} />
        <LoginPage onLoginSuccess={setCurrentUser} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Toaster position="top-right" reverseOrder={false} />

      <Navbar
        groups={groups}
        activeGroup={activeGroup}
        onSelectGroup={(g) => {
          setActiveGroup(g);
          setCurrentTab('expenses');
        }}
        onOpenCreateGroup={() => setIsCreateModalOpen(true)}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentTab === 'expenses' && activeGroup ? (
          <ExpenseSplitPage
            activeGroup={activeGroup}
            groups={groups}
            onSelectGroup={setActiveGroup}
            onUpdateGroup={handleUpdateGroup}
            onOpenCreateGroup={() => setIsCreateModalOpen(true)}
            onDeleteGroup={handleDeleteGroup}
          />
        ) : (
          <DashboardPage
            groups={groups}
            onSelectGroup={(g) => {
              setActiveGroup(g);
              setCurrentTab('expenses');
            }}
            onOpenCreateGroup={() => setIsCreateModalOpen(true)}
            onRefreshGroups={fetchGroups}
          />
        )}
      </main>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}

export default App;
