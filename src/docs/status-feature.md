# Status Feature Documentation

## Overview

The Status feature allows users to share photos, videos, and text updates that disappear after 24 hours. This feature is integrated with Appwrite for backend storage and is only visible in the streams page, similar to WhatsApp's status feature.

## Components

1. **StatusArea**: Main component that displays all statuses in a horizontal scrollable list
2. **StatusViewer**: Modal component for viewing status content
3. **CreateStatusModal**: Modal for creating new status updates

## Implementation Details

### Data Structure

Status updates are stored in Appwrite with the following structure:

- **status_updates** collection:
  - `id`: Unique identifier
  - `user_id`: ID of the user who created the status
  - `type`: Type of status ('photo', 'video', or 'text')
  - `content`: URL to media content or text content
  - `caption`: Optional text caption
  - `background`: CSS background class for text statuses
  - `created_at`: Timestamp when the status was created
  - `expires_at`: Timestamp when the status will expire (24 hours after creation)

- **status_views** collection:
  - `id`: Unique identifier
  - `status_id`: ID of the viewed status
  - `viewer_id`: ID of the user who viewed the status
  - `viewed_at`: Timestamp when the status was viewed

### Storage

Media files (photos and videos) are stored in the `status_media` bucket in Appwrite Storage.

## Setup

To set up the status feature, run:

```bash
npm run appwrite:init-status
```

This script will:
1. Create the `status_updates` collection if it doesn't exist
2. Create the `status_views` collection if it doesn't exist
3. Create the `status_media` storage bucket if it doesn't exist

## Usage

### Viewing Statuses

Statuses are displayed in a horizontal scrollable list at the top of the streams page. Users can click on a status to view it in full screen. The status viewer includes:

- Progress bars showing duration for each status
- Navigation controls to move between statuses
- User information and timestamp
- Status content (photo, video, or text)
- Caption (if provided)

### Creating a Status

1. Click on the "Add to your status" button in the status area
2. Choose the type of status you want to create:
   - **Photo**: Upload an image from your device
   - **Video**: Upload a video from your device
   - **Text**: Type text with a colorful background
3. For text statuses, select a background color/gradient
4. Add an optional caption
5. Click "Post Status"

### Status Lifecycle

- Statuses automatically expire after 24 hours
- Users can delete their own statuses before expiration
- Status views are tracked to show who has seen a status

## Technical Implementation

The status feature is implemented using:

- **StatusManager**: Core class that interacts with Appwrite for CRUD operations
- **statusService**: Service layer that provides a clean API for components
- **Appwrite Storage**: For storing media files
- **Appwrite Database**: For storing status metadata and view information

## Future Enhancements

- Status replies
- Status reactions
- Status mentions
- Status filters and effects
