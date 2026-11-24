import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, OrganizationMember, Organization } from '../types';
import { api, setApiAuth, getStoredOrgId } from '../lib/api';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  currentMembership: OrganizationMember | null;
  memberships: OrganizationMember[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentMembership, setCurrentMembership] = useState<OrganizationMember | null>(null);
  const [memberships, setMemberships] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('asyncflow_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res: any = await api.get('/auth/me');
      if (res && res.user) {
        setUser(res.user);
        setMemberships(res.memberships || []);

        const storedOrgId = getStoredOrgId();
        let activeMem = res.memberships?.find((m: any) => m.organizationId === storedOrgId);
        if (!activeMem && res.memberships?.length > 0) {
          activeMem = res.memberships[0];
        }

        if (activeMem) {
          setCurrentMembership(activeMem);
          setOrganization(activeMem.organization || null);
          setApiAuth(token, activeMem.organizationId);
        }
      }
    } catch (error) {
      console.warn('Failed to restore session:', error);
      setApiAuth(null, null);
      setUser(null);
      setCurrentMembership(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/login', { email, password });
      setApiAuth(res.tokens.accessToken, res.membership?.organizationId);
      setUser(res.user);
      if (res.membership) {
        setCurrentMembership(res.membership);
        setOrganization(res.membership.organization || null);
      }
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res: any = await api.post('/auth/register', data);
      setApiAuth(res.tokens.accessToken, res.organization?.id);
      setUser(res.user);
      setOrganization(res.organization || null);
      await fetchProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    } finally {
      setApiAuth(null, null);
      setUser(null);
      setOrganization(null);
      setCurrentMembership(null);
      setMemberships([]);
    }
  };

  const switchOrganization = (orgId: string) => {
    const mem = memberships.find((m) => m.organizationId === orgId);
    if (mem) {
      setCurrentMembership(mem);
      setOrganization(mem.organization || null);
      setApiAuth(localStorage.getItem('asyncflow_token'), orgId);
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        currentMembership,
        memberships,
        isLoading,
        login,
        register,
        logout,
        switchOrganization,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
