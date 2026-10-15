import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import OverviewCards from './components/OverviewCards';
import TrustChart from './components/TrustChart';
import DeviceTable from './components/DeviceTable';
import AddDeviceModal from './components/AddDeviceModal';
import DeviceDetailModal from './components/DeviceDetailModal';
import UnblockDeviceModal from './components/UnblockDeviceModal';
import RealTimeAlertPanel from './components/RealTimeAlertPanel';
import WokwiLiveNodeCard from './components/WokwiLiveNodeCard';

import LoginView from './views/LoginView';
import TrustEvaluationView from './views/TrustEvaluationView';
import AlertsView from './views/AlertsView';
import AnalyticsView from './views/AnalyticsView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

import { fetchDevices, fetchAlerts, fetchActiveAlerts } from './api';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trustweigh_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailModalDeviceId, setDetailModalDeviceId] = useState(null);
  const [unblockDeviceData, setUnblockDeviceData] = useState(null);
  const [selectedChartDevice, setSelectedChartDevice] = useState('WEIGH-ESP32-01');
  const [tableFilter, setTableFilter] = useState('all');

  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const [devs, allAlerts, actAlerts] = await Promise.all([
        fetchDevices(),
        fetchAlerts(),
        fetchActiveAlerts()
      ]);
      setDevices(devs);
      setAlerts(allAlerts);
      setActiveAlerts(actAlerts);
    } catch (err) {
      console.error('Failed to load live data:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
      const interval = setInterval(loadData, 3000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    loadData();
  };

  const handleLogout = () => {
    localStorage.removeItem('trustweigh_token');
    localStorage.removeItem('trustweigh_user');
    setCurrentUser(null);
  };

  const handleDeviceAdded = (newDev) => {
    setDevices(prev => [newDev, ...prev]);
    loadData();
  };

  const handleAlertAcknowledged = (alertId) => {
    loadData();
  };

  const handleOpenDetails = (devId) => {
    setDetailModalDeviceId(devId);
  };

  const handleOpenUnblockModal = (device) => {
    setUnblockDeviceData(device);
  };

  const handleDeviceUnblocked = (updatedDevice) => {
    loadData();
  };

  const handleCardClick = (statusType) => {
    if (statusType === 'alerts') {
      setActiveTab('alerts');
    } else {
      setTableFilter(statusType);
      setActiveTab('devices');
    }
  };

  // If user is not logged in, show Login Screen
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Calculations for overview
  const totalDevices = devices.length;
  const trustedDevices = devices.filter(d => d.trust_status === 'TRUSTED').length;
  const suspiciousDevices = devices.filter(d => d.trust_status === 'SUSPICIOUS').length;
  const tamperedDevices = devices.filter(d => d.trust_status === 'TAMPERED').length;
  const activeAlertsCount = activeAlerts.length;

  return (
    <div className="app-container">
      {/* Fixed Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeAlertsCount={activeAlertsCount} 
      />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Sticky Top Header */}
        <Header 
          activeAlerts={activeAlerts} 
          onAlertClick={(al) => {
            setDetailModalDeviceId(al.device_id);
          }}
          onRefresh={loadData}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Body */}
        <main className="page-body">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              {/* 1. Overview Metric Cards */}
              <OverviewCards 
                totalDevices={totalDevices}
                trustedDevices={trustedDevices}
                suspiciousDevices={suspiciousDevices}
                tamperedDevices={tamperedDevices}
                activeAlerts={activeAlertsCount}
                onCardClick={handleCardClick}
              />

              {/* 2. Wokwi Live Connected Edge Node Card (WEIGH-ESP32-01) */}
              <WokwiLiveNodeCard 
                onUnblockClick={handleOpenUnblockModal}
                onStateChange={loadData}
              />

              {/* 3. Real-Time Alert Highlight Banner */}
              <RealTimeAlertPanel 
                alerts={alerts}
                devices={devices}
                onAlertAcknowledged={handleAlertAcknowledged}
                onViewDevice={handleOpenDetails}
                onUnblockClick={handleOpenUnblockModal}
              />

              {/* 4. Dynamic Trust Score vs Time Chart */}
              <TrustChart 
                devices={devices}
                selectedDeviceId={selectedChartDevice}
                onDeviceSelect={setSelectedChartDevice}
              />

              {/* 5. Live Device Monitoring Table */}
              <DeviceTable 
                devices={devices}
                onViewDetails={handleOpenDetails}
                onAddDeviceClick={() => setIsAddModalOpen(true)}
                onUnblockClick={handleOpenUnblockModal}
                onDeviceUpdated={loadData}
                initialFilter="all"
              />
            </div>
          )}

          {/* TAB 2: DEVICES */}
          {activeTab === 'devices' && (
            <div>
              <WokwiLiveNodeCard 
                onUnblockClick={handleOpenUnblockModal}
                onStateChange={loadData}
              />
              <DeviceTable 
                devices={devices}
                onViewDetails={handleOpenDetails}
                onAddDeviceClick={() => setIsAddModalOpen(true)}
                onUnblockClick={handleOpenUnblockModal}
                onDeviceUpdated={loadData}
                initialFilter={tableFilter}
              />
            </div>
          )}

          {/* TAB 3: TRUST EVALUATION */}
          {activeTab === 'trust' && (
            <div>
              <WokwiLiveNodeCard 
                onUnblockClick={handleOpenUnblockModal}
                onStateChange={loadData}
              />
              <TrustEvaluationView 
                devices={devices}
                onRefresh={loadData}
                onViewDetails={handleOpenDetails}
                onUnblockClick={handleOpenUnblockModal}
              />
            </div>
          )}

          {/* TAB 4: ALERTS */}
          {activeTab === 'alerts' && (
            <AlertsView 
              alerts={alerts}
              onAlertAcknowledged={handleAlertAcknowledged}
              onViewDevice={handleOpenDetails}
            />
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView 
              onSettingsSaved={loadData}
            />
          )}
        </main>
      </div>

      {/* Registration Modal */}
      <AddDeviceModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onDeviceAdded={handleDeviceAdded}
      />

      {/* Admin Unblock Modal */}
      <UnblockDeviceModal
        isOpen={!!unblockDeviceData}
        device={unblockDeviceData}
        onClose={() => setUnblockDeviceData(null)}
        onDeviceUnblocked={handleDeviceUnblocked}
      />

      {/* Full Device Dossier / Inspector Modal */}
      <DeviceDetailModal 
        deviceId={detailModalDeviceId}
        isOpen={!!detailModalDeviceId}
        onClose={() => setDetailModalDeviceId(null)}
        onUnblockClick={handleOpenUnblockModal}
        onDeviceUpdated={loadData}
      />
    </div>
  );
}
