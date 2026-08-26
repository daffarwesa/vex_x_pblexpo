import TutorialSection from '@/components/layout/TutorialSection';
import type { TutorialSubsection } from '@/components/layout/TutorialSection';

export const metadata = {
    title: 'Tutorial - Visitor Guide | V-EX+',
};

const sections: TutorialSubsection[] = [
    {
        number: '1',
        title: 'Visitor Dashboard',
        description:
            'The visitor dashboard is the main page displayed after a visitor successfully logs into the system. This page shows a summary of information and navigation to access the various features available.',
        steps: [
            'After logging in successfully, the visitor will be directed to the visitor dashboard page.',
            'Visitors can start exploring available exhibitions by clicking on one of the exhibitions displayed.',
        ],
    },
    {
        number: '2',
        title: 'Accessing Exhibitions',
        description:
            'Visitors can access ongoing exhibitions or view upcoming exhibitions through the dashboard page or the exhibition list.',
        steps: [
            'On the dashboard page, visitors can see a list of available exhibitions.',
            'Each available exhibition displays information such as: Exhibition Title (e.g., TERPAL DEMO DAY 2025), the organizing Study Program (e.g., Software Engineering Technology), and the number of projects displayed.',
            'Visitors can also view upcoming exhibitions.',
            'To access an exhibition, visitors click on one of the available exhibitions.',
            'The system will display the exhibition detail page.',
        ],
    },
    {
        number: '3',
        title: 'Searching for Exhibitions',
        description: 'Visitors can search for a desired exhibition using the available search feature.',
        steps: [
            'On the navigation menu, visitors select the "EXHIBITION" menu.',
            'The system will display a list of all available exhibitions.',
            'Visitors can search using a keyword (exhibition title) or by year.',
            'The system will display search results matching the selected criteria.',
            'Visitors can click on one of the search results to view the exhibition details.',
        ],
    },
    {
        number: '4',
        title: 'Accessing the Virtual Exhibition',
        steps: [
            'On the dashboard or exhibition list page, select one of the exhibitions (e.g., TERPAL DEMO DAY 2025).',
            'The system displays the exhibition detail page containing the title, study program, date, description, and exhibition theme.',
            'Click the play button to enter the 3D exhibition.',
        ],
    },
    {
        number: '5',
        title: 'Virtual Exhibition Guide',
        description: 'Before entering the 3D exhibition, the system displays a navigation control guide.',
        steps: [
            'Read the Control Guide, which contains navigation instructions: use the mouse to look around, click to interact, and use the navigation keys (WASD/arrow keys) to move, plus the SPACE key to jump.',
            'Click "Continue" to enter the 3D exhibition, or "Skip" to explore right away.',
        ],
    },
    {
        number: '6',
        title: 'Virtual Exhibition View',
        steps: [
            'The system loads the 3D exhibition view after the visitor clicks "Continue".',
            'Explore the exhibition space using the mouse to look in any direction, the keyboard (arrow keys/WASD) to move, and click on objects/posters to interact.',
            'To view project details, point the cursor at a project poster at a booth, then click. The system displays a project detail pop-up containing the title, description, creator information, and number of likes.',
            'Close the pop-up and move on to another booth.',
            'To exit the 3D view, press "ESC" on the keyboard, then click the "Exit" button. The system will redirect back to the exhibition detail page.',
        ],
    },
    {
        number: '7',
        title: 'Viewing Project Details',
        description: 'Visitors can view complete information about a displayed project.',
        steps: [
            'In the 3D exhibition view, visitors approach the desired booth.',
            'Visitors click on the poster at the booth.',
            'The system will display a detail pop-up for the selected project.',
            'Visitors can read the description to learn more about the project.',
        ],
    },
    {
        number: '8',
        title: 'Liking and Commenting',
        description: 'Logged-in visitors can like and comment on displayed projects.',
        steps: [
            'On the project detail page, visitors see the like icon and the available like count.',
            'Visitors click the like icon to like the project.',
            'The system will add a like and display the updated total like count in real time.',
            'If the visitor clicks again, the system will remove the like (unlike).',
            'To comment, visitors scroll to the comment section and view the list of comments from other users.',
            'Visitors write a comment in the available field, then press the "Send" button to submit the comment.',
        ],
    },
    {
        number: '9',
        title: 'Viewing the Exhibition Map',
        description: 'The exhibition map displays the room layout and a list of all projects displayed within an exhibition.',
        steps: [
            'In the 3D exhibition view, visitors click the "Exhibition Map" button located in the top-right corner of the screen.',
            'The system displays the exhibition map, showing the room layout divided into areas (e.g., Class A, B, C, D), a list of all projects in each area, and information for each project (title, description, components).',
            'To view project details, visitors click on one of the projects shown on the map.',
            'The system displays complete information about that project.',
            'To return to the 3D view, visitors click the "close" (X) button in the top-right corner of the map.',
        ],
    },
];

export default function TutorialPengunjungPage() {
    return (
        <TutorialSection
            title="TUTORIAL"
            subtitle="VISITOR GUIDE"
            intro="A complete guide for visitors: from exploring exhibitions, entering the 3D virtual exhibition space, viewing project details, liking and commenting, to using the exhibition map."
            sections={sections}
        />
    );
}