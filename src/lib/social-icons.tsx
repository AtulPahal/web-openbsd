"use client";

import type { SVGProps } from "react";

interface SocialIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const GitHubIcon = ({ size = 16, ...props }: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.469-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.013.005 2.027.137 3.004.404 2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.244 2.873.119 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.81 5.624-5.475 5.92.429.369.812 1.096.812 2.21 0 1.606-.015 2.896-.015 3.286 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

export const LinkedInIcon = ({ size = 16, ...props }: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export const EmailIcon = ({ size = 16, ...props }: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M1.5 4.5A1.5 1.5 0 0 1 3 3h18a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5v-15zm3.17 1.5L12 11.83 19.33 6H4.67zM21 7.38l-8.47 6.35a1 1 0 0 1-1.06 0L3 7.38V18h18V7.38z" />
  </svg>
);

/** Authentic Kitty Terminal mascot vector icon */
export const KittyIcon = ({ size = 16, ...props }: SocialIconProps) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Kitty Cat Head Silhouette */}
    <path
      d="M3.5 6.5L6.8 3.5C7.2 3.1 7.9 3.3 8.1 3.9L9.2 7H14.8L15.9 3.9C16.1 3.3 16.8 3.1 17.2 3.5L20.5 6.5C21.4 7.4 22 8.7 22 10.1C22 16.2 17.5 21 12 21C6.5 21 2 16.2 2 10.1C2 8.7 2.6 7.4 3.5 6.5Z"
      className="fill-current"
    />
    {/* Cat Eyes */}
    <circle cx="8" cy="11.5" r="1.5" className="fill-background" />
    <circle cx="16" cy="11.5" r="1.5" className="fill-background" />
    {/* Cat Nose & Mouth */}
    <polygon points="12,13.5 10.8,15.2 13.2,15.2" className="fill-background" />
    <path
      d="M12 15.2V16.8C11.3 17.5 10.4 17.5 9.8 17.1M12 16.8C12.7 17.5 13.6 17.5 14.2 17.1"
      stroke="var(--background)"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* Whiskers */}
    <path
      d="M4.5 12H7.5M4 14.5H7.2M19.5 12H16.5M20 14.5H16.8"
      stroke="var(--background)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
