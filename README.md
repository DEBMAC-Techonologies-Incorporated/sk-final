# SK Projects Management System

A streamlined Next.js application designed to manage SK Projects through a structured 5-step workflow process, providing teams with clear documentation and progress tracking capabilities.

## 🚀 Features

### Core Functionality
- **Multi-project dashboard** with visual progress tracking
- **5-step workflow system**: Planning → Approval → Resolution → DV → Withdrawal
- **Markdown editor** for each step with live preview
- **Local storage** persistence (no backend required)
- **Export functionality** to download complete project documentation
- **Responsive design** that works on desktop and mobile

### Project Management
- Create and manage multiple SK projects
- Track completion status for each step
- Search and filter projects
- Visual progress indicators
- Project statistics and analytics

### Documentation Features
- Rich markdown editing with syntax highlighting
- Live preview of formatted content
- Auto-save functionality
- Step-by-step navigation
- Export to markdown format

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui inspiration
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage
- **Build Tool**: npm

## 📋 Project Structure

```
sk-final/
├── src/
│   ├── app/
│   │   ├── project/[id]/        # Project detail pages
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx            # Dashboard (homepage)
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   │       ├── button.tsx
│   │       └── card.tsx
│   └── lib/
│       ├── storage.ts          # LocalStorage utilities
│       ├── types.ts            # TypeScript interfaces
│       └── utils.ts            # Helper functions
├── PROJECT_OVERVIEW.md         # Detailed system overview
├── package.json
└── README.md
```

## 🎯 5-Step Workflow

Each SK project follows this structured workflow:

1. **Planning** - Initial project scope, requirements, and strategy documentation
2. **Approval** - Stakeholder review, sign-offs, and authorization documents  
3. **Resolution** - Implementation details, technical solutions, and execution plans
4. **DV (Design Verification)** - Testing, validation, and quality assurance documentation
5. **Withdrawal** - Project closure, lessons learned, and final reports

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sk-final
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

#### Creating a New Project
1. Click "New Project" on the dashboard
2. Enter project title and description
3. Click "Create Project"
4. You'll be redirected to the project detail page

#### Working with Steps
1. Navigate to a project from the dashboard
2. Use the step navigation to switch between the 5 workflow steps
3. Enter content using markdown formatting in the editor
4. Click "Save" to persist changes
5. Mark steps as complete when finished
6. Export the entire project as a markdown file

#### Markdown Support
The editor supports standard markdown formatting:
- `# Heading` for headings
- `**bold**` for bold text
- `*italic*` for italic text
- `` `code` `` for inline code
- `- item` for bullet points
- `1. item` for numbered lists

## 📊 Features in Detail

### Dashboard
- **Project Cards**: Visual cards showing project title, description, and progress
- **Progress Indicators**: 5-step progress bars with completion percentages
- **Search**: Real-time search through project titles and descriptions
- **Statistics**: Total projects, completed projects, and in-progress counts

### Project Detail Page
- **Step Navigation**: Tab-based navigation between the 5 workflow steps
- **Markdown Editor**: Full-featured text editor with markdown support
- **Live Preview**: Real-time preview of formatted markdown content
- **Progress Tracking**: Visual progress indicator and step completion status
- **Export**: Download complete project documentation as markdown file

### Data Management
- **Auto-save**: Content is automatically saved when switching steps
- **Local Storage**: All data persisted in browser localStorage
- **Data Import/Export**: Export projects as markdown files
- **No Backend Required**: Fully client-side application

## 🔧 Configuration

### Customizing Steps
To modify the 5-step workflow, edit the `PROJECT_STEPS` array in `src/lib/types.ts`:

```typescript
export const PROJECT_STEPS = [
  {
    key: 'planning',
    label: 'Planning',
    description: 'Your custom description'
  },
  // ... other steps
];
```

### Styling
The application uses Tailwind CSS with a custom design system. Colors and themes can be modified in:
- `src/app/globals.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and team collaboration
- [ ] Advanced markdown editor with WYSIWYG mode
- [ ] Project templates and workflows
- [ ] API integration for third-party tools
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Real-time collaboration features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- The open-source community for inspiration and tools
