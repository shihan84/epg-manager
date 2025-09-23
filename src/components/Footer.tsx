'use client';

import Link from 'next/link';
import { ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">EPG Manager</h3>
            <p className="text-gray-400 text-sm">
              Professional Electronic Program Guide management system for TV
              channel streamers and distributors.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://itassist.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/management"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Content Management
                </Link>
              </li>
              <li>
                <Link
                  href="/epg"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  EPG Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/subscription"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Subscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Channel Management</li>
              <li>Program Scheduling</li>
              <li>EPG Generation</li>
              <li>Multi-language Support</li>
              <li>API Access</li>
              <li>Hosted EPG URLs</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:info@itassist.co.in"
                  className="hover:text-white transition-colors"
                >
                  info@itassist.co.in
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <a
                  href="https://itassist.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  itassist.co.in
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear}{' '}
              <strong className="text-white">
                Ultimate News Web Media Production Pvt Ltd
              </strong>
              . All rights reserved.
            </div>
            <div className="text-sm text-gray-400">
              <span className="text-white font-semibold">EPG Manager™</span> is
              a trademark of Ultimate News Web Media Production Pvt Ltd
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              This software is proprietary and confidential. Unauthorized
              copying, distribution, or modification is strictly prohibited.
            </p>
            <p className="mt-1">
              For licensing inquiries, please contact us at{' '}
              <a
                href="mailto:licensing@itassist.co.in"
                className="text-gray-400 hover:text-white transition-colors"
              >
                licensing@itassist.co.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
