# React ChatBot Application

A modern chatbot application built with React, TypeScript, and Vite. Features include voice and text-based interactions with an AI assistant.

## Features

- Voice input and output
- Text-based chat interface
- Real-time conversation history
- Modern UI with animations
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key
- Backend server running (for handling messages)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```
VITE_OPENAI_URI=https://api.openai.com/v1/audio/transcriptions
VITE_OPENAI_KEY=your_openai_api_key_here
VITE_BACKEND_URI=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Web Speech API
- OpenAI API

## Project Structure

```
src/
  ├── components/
  │   └── chatBot/
  │       ├── ChatBot.tsx
  │       ├── styles.css
  │       ├── aivoice.gif
  │       └── robot3.png
  ├── App.tsx
  ├── main.tsx
  ├── index.css
  └── env.d.ts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
