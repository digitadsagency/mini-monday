import { google } from 'googleapis';

// NO cachear auth para evitar problemas entre diferentes proyectos/spreadsheets
export const getSheetsClient = async () => {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
    
    console.log('🔧 Sheets Config:', {
      clientEmail: clientEmail ? `${clientEmail.substring(0, 20)}...` : 'NOT SET',
      spreadsheetId: spreadsheetId ? `${spreadsheetId.substring(0, 15)}...` : 'NOT SET',
      hasPrivateKey: !!privateKey
    });
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
    
    console.log('✅ Google Sheets authentication initialized');
    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
  } catch (error) {
    console.error('❌ Error initializing Google Sheets auth:', error);
    throw error;
  }
};

export const getSpreadsheetId = (): string => {
  const id = process.env.SHEETS_SPREADSHEET_ID;
  if (!id) {
    throw new Error('SHEETS_SPREADSHEET_ID environment variable is required');
  }
  console.log('📊 Using Spreadsheet ID:', id.substring(0, 15) + '...');
  return id;
};

export const getSheetName = (entity: string): string => {
  const sheetNames: Record<string, string> = {
    workspaces: 'workspaces',
    workspace_members: 'workspace_members',
    projects: 'projects',
    project_members: 'project_members',
    tasks: 'tasks',
    task_comments: 'task_comments',
    task_labels: 'task_labels',
    attachments: 'attachments',
    activity_log: 'activity_log',
  };
  
  return sheetNames[entity] || entity;
};
