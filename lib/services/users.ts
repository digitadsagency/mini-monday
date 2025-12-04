import { getSheetsClient, getSpreadsheetId, getSheetName } from '@/lib/sheets/client';

const USERS_SHEET_NAME = getSheetName('users');

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role?: 'owner' | 'admin' | 'member';
  avatar?: string;
  password?: string;
  created_at?: string;
}

export const UsersService = {
  async getAllUsers(): Promise<User[]> {
    const sheets = await getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    try {
      // Intentar leer un rango más amplio para asegurar que capturamos todas las columnas
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${USERS_SHEET_NAME}!A:Z`, // Leer hasta Z para capturar todas las columnas posibles
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('⚠️ No users found in Google Sheets');
        return [];
      }

      // La primera fila son los headers
      const headers = rows[0] || [];
      console.log('📋 User sheet headers:', headers);

      // Mapear las filas a objetos usuario
      const users: User[] = rows.slice(1)
        .filter(row => row && row.length > 0 && row[0]) // Filtrar filas vacías
        .map(row => {
          const user: User = {
            id: '',
            email: '',
          };

          headers.forEach((header, index) => {
            const headerLower = (header || '').toLowerCase().trim();
            const value = row[index];

            switch (headerLower) {
              case 'id':
                user.id = value || '';
                break;
              case 'email':
                user.email = (value || '').toLowerCase().trim();
                break;
              case 'name':
                user.name = value || '';
                break;
              case 'username':
                user.username = value || '';
                break;
              case 'role':
                user.role = (value || 'member') as 'owner' | 'admin' | 'member';
                break;
              case 'avatar':
                user.avatar = value || '';
                break;
              case 'password':
                user.password = value || '';
                break;
              case 'created_at':
                user.created_at = value || '';
                break;
              default:
                // Si hay otros campos, los ignoramos por ahora
                break;
            }
          });

          return user;
        })
        .filter(user => user.id && user.email); // Solo usuarios válidos con id y email

      console.log(`✅ Loaded ${users.length} users from Google Sheets`);
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.name || user.username || 'Sin nombre'}) - Role: ${user.role || 'member'} - Has password: ${!!user.password}`);
      });

      return users;
    } catch (error) {
      console.error('❌ Error fetching users from Google Sheets:', error);
      throw error;
    }
  },

  async getUserById(userId: string): Promise<User | undefined> {
    const users = await this.getAllUsers();
    return users.find(user => user.id === userId);
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await this.getAllUsers();
    const searchEmail = email.toLowerCase().trim();
    return users.find(user => {
      const userEmail = (user.email || '').toLowerCase().trim();
      return userEmail === searchEmail;
    });
  }
};
