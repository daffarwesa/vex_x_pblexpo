import TutorialSection from '@/components/layout/TutorialSection';
import type { TutorialSubsection } from '@/components/layout/TutorialSection';

export const metadata = {
    title: 'Tutorial - Creator Guide | V-EX+',
};

const sections: TutorialSubsection[] = [
    {
        number: '1',
        title: 'Creator Dashboard',
        description: 'The Creator dashboard is the main page displayed after a Creator successfully logs into the system.',
        steps: ['After logging in successfully, the Creator will be directed to the Creator dashboard page.'],
    },
    {
        number: '2',
        title: 'Manage Projects',
        steps: [
            'On the Creator dashboard, select the "Manage Projects" menu.',
            'The system displays a list of all projects that have been added.',
        ],
    },
    {
        number: '3',
        title: 'Add Project',
        steps: [
            'Click the "Add" button to add a project.',
            'Fill in the data, consisting of: Project Title, Study Program, Exhibition (select from available exhibitions), Select Booth/Stand, Demo Video Link (YouTube), Upload Poster (max 2MB), Upload Cover (max 2MB), and Project Description (max 200 characters).',
            'Click "Save" to save the project.',
        ],
    },
    {
        number: '4',
        title: 'Edit Project',
        steps: [
            'In the project list, the Creator can click on the poster they want to change/edit.',
            'Change the required data (title, description, image, video, etc.).',
            'Click "Save".',
        ],
    },
];

export default function TutorialKetuaPblPage() {
    return (
        <TutorialSection
            title="TUTORIAL"
            subtitle="CREATOR GUIDE"
            intro="A guide for Creators on managing and adding their group's project to the V-EX+ exhibition."
            sections={sections}
        />
    );
}