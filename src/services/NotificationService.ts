'use client';

import { AppNotification, AlertRule, Risk } from '@/types';

const NOTIFICATIONS_KEY = 'appNotifications';
const ALERT_RULES_KEY = 'alertRules';

export class NotificationService {
  // In-app Notifications
  static createNotification(notification: Omit<AppNotification, 'id' | 'timestamp'>): AppNotification {
    const notifications = this.getAllNotifications();
    const newNotification: AppNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    notifications.push(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return newNotification;
  }

  static getAllNotifications(): AppNotification[] {
    if (typeof window === 'undefined') return [];
    try {
      const notifs = localStorage.getItem(NOTIFICATIONS_KEY);
      return notifs ? JSON.parse(notifs) : [];
    } catch {
      return [];
    }
  }

  static getUserNotifications(userId: string): AppNotification[] {
    return this.getAllNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static getUnreadCount(userId: string): number {
    return this.getUserNotifications(userId).filter(n => !n.read).length;
  }

  static markAsRead(notificationId: string): void {
    const notifications = this.getAllNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  }

  static markAllAsRead(userId: string): void {
    const notifications = this.getAllNotifications();
    notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  static deleteNotification(notificationId: string): void {
    const notifications = this.getAllNotifications().filter(n => n.id !== notificationId);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  // External Channel Notifications (Mock)
  static async sendEmail(to: string, subject: string, message: string): Promise<boolean> {
    console.log(`📧 Email sent to ${to}:`, subject, message);
    // In production, call your backend API
    return Promise.resolve(true);
  }

  static async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    console.log(`📱 SMS sent to ${phoneNumber}:`, message);
    // In production, integrate with Twilio, Vonage, etc.
    return Promise.resolve(true);
  }

  static async sendTelegram(chatId: string, message: string): Promise<boolean> {
    console.log(`🤖 Telegram sent to ${chatId}:`, message);
    // In production, integrate with Telegram Bot API
    return Promise.resolve(true);
  }

  // Alert Rules Management
  static createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt'>): AlertRule {
    const rules = this.getAllAlertRules();
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    rules.push(newRule);
    localStorage.setItem(ALERT_RULES_KEY, JSON.stringify(rules));
    return newRule;
  }

  static getAllAlertRules(): AlertRule[] {
    if (typeof window === 'undefined') return [];
    try {
      const rules = localStorage.getItem(ALERT_RULES_KEY);
      return rules ? JSON.parse(rules) : [];
    } catch {
      return [];
    }
  }

  static getProjectAlertRules(projectId: string): AlertRule[] {
    return this.getAllAlertRules().filter(r => r.projectId === projectId && r.enabled);
  }

  static deleteAlertRule(ruleId: string): void {
    const rules = this.getAllAlertRules().filter(r => r.id !== ruleId);
    localStorage.setItem(ALERT_RULES_KEY, JSON.stringify(rules));
  }

  static evaluateAlerts(projectId: string, risks: Risk[], userId: string, username: string, userEmail: string): void {
    const rules = this.getProjectAlertRules(projectId);
    
    rules.forEach(rule => {
      let shouldAlert = false;
      let alertMessage = '';

      switch (rule.condition) {
        case 'high_risk_count': {
          const highRisks = risks.filter(r => r.severity === 'high' || r.severity === 'critical');
          if (highRisks.length >= rule.threshold) {
            shouldAlert = true;
            alertMessage = `⚠️ Có ${highRisks.length} rủi ro cấp cao trong dự án`;
          }
          break;
        }
        case 'critical_risk': {
          const criticalRisks = risks.filter(r => r.severity === 'critical');
          if (criticalRisks.length > 0) {
            shouldAlert = true;
            alertMessage = `🚨 Phát hiện ${criticalRisks.length} rủi ro NGHIÊM TRỌNG`;
          }
          break;
        }
        case 'risk_not_resolved': {
          const unresolved = risks.filter(r => r.status !== 'resolved');
          if (unresolved.length >= rule.threshold) {
            shouldAlert = true;
            alertMessage = `⏰ Có ${unresolved.length} rủi ro chưa được giải quyết`;
          }
          break;
        }
        case 'severity_threshold': {
          const highScoreRisks = risks.filter(r => (r.riskScore ?? 0) >= rule.threshold);
          if (highScoreRisks.length > 0) {
            shouldAlert = true;
            alertMessage = `⚡ ${highScoreRisks.length} rủi ro vượt mức cảnh báo`;
          }
          break;
        }
      }

      if (shouldAlert) {
        // In-app notification
        this.createNotification({
          userId,
          title: rule.name,
          message: alertMessage,
          type: 'alert',
          read: false,
          projectId
        });

        // External notifications
        rule.notificationChannels.forEach(channel => {
          switch (channel) {
            case 'email':
              this.sendEmail(userEmail, rule.name, alertMessage);
              break;
            case 'sms':
              // In production: use user's phone number from profile
              this.sendSMS('+84XXXXXXXXX', alertMessage);
              break;
            case 'telegram':
              // In production: use user's telegram chat ID from profile
              this.sendTelegram('CHAT_ID', alertMessage);
              break;
          }
        });
      }
    });
  }
}
