import TutorialSection from '@/components/layout/TutorialSection';
import type { TutorialSubsection } from '@/components/layout/TutorialSection';

export const metadata = {
    title: 'Tutorial - Admin Guide | V-EX+',
};

const sections: TutorialSubsection[] = [
    {
        number: '1',
        title: 'Admin Dashboard',
        description:
            'The admin dashboard is the main page displayed after the admin successfully logs into the system. This page shows a summary of information and navigation for managing all application features.',
        steps: [
            'After logging in successfully, the admin will be directed to the dashboard page, which displays a list of Creators.',
        ],
    },
    {
        number: '2',
        title: 'Manage Creator Accounts',
        description: 'Admins can manage user accounts with the Creator role.',
        steps: [
            'On the admin dashboard, select the "Users" menu.',
            'The system displays a list of all registered users, grouped by Creators.',
        ],
    },
    {
        number: '3',
        title: 'Add User',
        steps: [
            'Click the "Add" button to add a user.',
            'Select the account type: "Creator".',
            'Fill in the form/data (Name, Email, Study Program/Class, and Status).',
            'Click "Save".',
        ],
    },
    {
        number: '4',
        title: 'Edit User',
        steps: [
            'Click the "Edit" icon on the desired user.',
            'Change the required data.',
            'Click "Save".',
        ],
    },
    {
        number: '5',
        title: 'Edit Status',
        steps: [
            'Click the "green checkmark" icon (✅) on the user whose status you want to change.',
            'The system will automatically change the user\'s status to "Active" or "Inactive".',
            'The status has been successfully updated.',
        ],
    },
    {
        number: '6',
        title: 'Manage Exhibitions',
        description:
            'Admins can manage the exhibitions being held. These changes affect all users, where Creators can only add projects while the exhibition has not yet been published.',
        steps: [
            'On the admin dashboard, select the "Exhibition" menu.',
            'The system displays a list of all exhibitions that have been created.',
        ],
    },
    {
        number: '7',
        title: 'Add Exhibition',
        steps: [
            'Click the "Add Exhibition" icon.',
            'Fill in the data: Thumbnail, Study Program, Exhibition Title, Exhibition Date (start), Preparation Date (start and end), and Description.',
            'Click "Save".',
        ],
    },
    {
        number: '8',
        title: 'Edit Exhibition',
        steps: [
            'In the exhibition list, click the "Edit" icon (pencil) on the exhibition you want to change.',
            'The system displays the exhibition edit form.',
            'Change the required data (Thumbnail, Study Program, Exhibition Title, etc.).',
            'Click "Save" to save the changes.',
        ],
    },
    {
        number: '9',
        title: 'Delete Project',
        steps: [
            'Click the "Projects" icon.',
            'Click the project you want to delete.',
            'Scroll down on the project detail page, then click the "Delete" button.',
            'The system displays a deletion confirmation, click "Yes, Delete" to permanently delete the project.',
        ],
    },
];

export default function TutorialAdminPage() {
    return (
        <TutorialSection
            title="TUTORIAL"
            subtitle="ADMIN GUIDE"
            intro="A guide for admins on managing users (Creators), managing exhibitions, and managing projects displayed on V-EX+."
            sections={sections}
        />
    );
}