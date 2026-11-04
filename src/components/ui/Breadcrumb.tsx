"use client";
import React from 'react';
import Link from 'next/link';

interface BreadcrumbProps {
  title?: string;
  subTitle: string;
  breadcrumbItems: { label: string; href?: string }[];
}

export default function Breadcrumb({ title, subTitle, breadcrumbItems }: BreadcrumbProps) {
  return (
    <div className="flex items-center mb-4">
      <nav aria-label="breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 list-none p-0 m-0">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <li className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                {item.href ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
              <li className="text-gray-400 dark:text-gray-600">›</li>
            </React.Fragment>
          ))}
          <li className="text-green-600 dark:text-green-400 font-medium" aria-current="page">
            {subTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
}