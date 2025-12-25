# Workflow Testing Guide

## Overview
All document upload and download workflows are now available for testing with separate desktop and mobile views.

## Access Workflow Testing Page

Navigate to: **`/workflows/testing`**

This page provides a centralized hub for testing all workflow variations.

## Available Workflows

### 1. Upload Workflow - Desktop
- **URL**: `/workflows/upload?device=desktop`
- **Features**: 
  - Grid layout for multiple documents
  - Drag & drop support
  - Simultaneous upload preview
  - Progress tracking

### 2. Upload Workflow - Mobile
- **URL**: `/workflows/upload?device=mobile`
- **Features**:
  - One-by-one upload flow
  - Mobile-optimized layout
  - Touch-friendly interface
  - Document navigation (Previous/Next buttons)

### 3. Download Workflow - Desktop
- **URL**: `/workflows/download?device=desktop`
- **Features**:
  - Table layout for documents
  - Bulk download option
  - Individual downloads
  - Document metadata display

### 4. Download Workflow - Mobile
- **URL**: `/workflows/download?device=mobile`
- **Features**:
  - Card-based layout
  - Mobile-optimized UI
  - Download all option
  - Touch-friendly buttons

## Testing from Document Center

In the Document Center (`/document-center`), you can also access these workflows via the "Test Workflow" buttons:

1. For **upload** workflow: Available in the rejection dialog for pending documents
2. For **download** workflow: Available in the dropdown menu for approved documents

## Phone Verification

All workflows include phone verification as the first step:
- Enter any 6-digit code to verify (for testing purposes)
- Code verification is simulated - any 6 digits will work
- After verification, you'll proceed to the document upload/download screen

## Desktop vs Mobile Views

The workflows automatically detect screen size, but you can force a specific view using the `device` parameter:
- `?device=desktop` - Forces desktop view (multi-document grid/table)
- `?device=mobile` - Forces mobile view (one-by-one flow)

This is useful for testing both experiences without resizing your browser window.

## Quick Access URLs

For quick testing, bookmark these URLs:

- **Upload Desktop**: `http://localhost:5173/workflows/upload?device=desktop`
- **Upload Mobile**: `http://localhost:5173/workflows/upload?device=mobile`
- **Download Desktop**: `http://localhost:5173/workflows/download?device=desktop`
- **Download Mobile**: `http://localhost:5173/workflows/download?device=mobile`
- **Testing Hub**: `http://localhost:5173/workflows/testing`

## What Each Workflow Does

### Upload Workflows
Clients receive a magic link via email/SMS to upload requested documents. After phone verification:
- **Desktop**: Shows all requested documents in a 2-column grid, allowing simultaneous upload
- **Mobile**: Shows one document at a time with Previous/Next navigation

### Download Workflows
Clients receive a magic link to download completed documents. After phone verification:
- **Desktop**: Shows all documents in a table with individual or bulk download options
- **Mobile**: Shows documents as cards with individual download buttons and "Download All" option

## Testing Tips

1. **Test in New Window**: The testing page has a "Test Workflow" button that opens each workflow in a new window, simulating the real client experience
2. **Test Responsiveness**: Change the `device` parameter to switch between desktop and mobile views
3. **Test Complete Flow**: Go through the entire flow from verification code to successful upload/download
4. **Test Multiple Documents**: Upload/download scenarios include 3 mock documents to test navigation and progress tracking
