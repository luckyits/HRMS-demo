import React, { createContext, useContext, useEffect, useState } from 'react'
import type { CompanyType, DemoSettings, EmployeeType, Role } from '../types'

const DEFAULT_DEMO_SETTINGS: DemoSettings = {
  role: 'HR Admin',
  employeeType: 'Office Staff',
  companyType: 'IT',
  phonePreview: false,
  offlineMode: false,
  currentUser: {
    name: 'Sarah Jenkins',
    title: 'Chief People Officer / HR Lead',
    email: 'sarah.jenkins@company-erp.internal',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    empId: 'EMP-00101',
    department: 'People Operations',
    branch: 'Headquarters - Tech Park',
  },
}

interface DemoContextType {
  settings: DemoSettings
  setRole: (role: Role) => void
  setEmployeeType: (employeeType: EmployeeType) => void
  setCompanyType: (companyType: CompanyType) => void
  setPhonePreview: (enabled: boolean) => void
  setOfflineMode: (enabled: boolean) => void
  resetDemoData: () => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

const STORAGE_KEY = 'universal_hrms_demo_settings'

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<DemoSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Fallback
    }
    return DEFAULT_DEMO_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  const setRole = (role: Role) => {
    let userName = 'Sarah Jenkins'
    let userTitle = 'Chief People Officer'
    let avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    let empId = 'HR-00101'

    if (role === 'Manager') {
      userName = 'Vikram Malhotra'
      userTitle = 'Engineering & Ops Manager'
      avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      empId = 'MGR-00204'
    } else if (role === 'Employee') {
      userName = 'Aarav Patel'
      userTitle = 'Senior Associate'
      avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      empId = 'EMP-00512'
    }

    setSettings(prev => ({
      ...prev,
      role,
      currentUser: {
        ...prev.currentUser,
        name: userName,
        title: userTitle,
        avatar,
        empId,
      }
    }))
  }

  const setEmployeeType = (employeeType: EmployeeType) => {
    setSettings(prev => ({ ...prev, employeeType }))
  }

  const setCompanyType = (companyType: CompanyType) => {
    setSettings(prev => ({ ...prev, companyType }))
  }

  const setPhonePreview = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, phonePreview: enabled }))
  }

  const setOfflineMode = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, offlineMode: enabled }))
  }

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY)
    // Clear demo storage keys
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('hrms_demo_'))
    keysToRemove.forEach(k => localStorage.removeItem(k))
    setSettings(DEFAULT_DEMO_SETTINGS)
  }

  return (
    <DemoContext.Provider
      value={{
        settings,
        setRole,
        setEmployeeType,
        setCompanyType,
        setPhonePreview,
        setOfflineMode,
        resetDemoData,
      }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}
