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
      // Leer las columnas A-G específicamente según la estructura esperada:
      // A: id, B: email, C: name, D: role, E: avatar, F: password, G: created_at
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${USERS_SHEET_NAME}!A:G`,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('⚠️ No users found in Google Sheets');
        return [];
      }

      // La primera fila son los headers
      const headers = rows[0] || [];
      console.log('📋 User sheet headers (raw):', headers);
      
      // Detectar si hay headers duplicados o mal etiquetados
      // La estructura esperada es: id, email, name, role, avatar, password, created_at
      // Si la columna F (índice 5) tiene header "created_at" pero los datos parecen passwords,
      // significa que el header está mal etiquetado
      const expectedHeaders = ['id', 'email', 'name', 'role', 'avatar', 'password', 'created_at'];
      
      // Verificar si hay problema con los headers (dos "created_at")
      const createdAtCount = headers.filter((h: string) => 
        (h || '').toLowerCase().trim() === 'created_at'
      ).length;
      
      const hasPasswordHeader = headers.some((h: string) => 
        (h || '').toLowerCase().trim() === 'password'
      );
      
      console.log('📋 Header analysis:', { 
        createdAtCount, 
        hasPasswordHeader,
        needsPositionalMapping: createdAtCount > 1 || !hasPasswordHeader
      });

      // Mapear las filas a objetos usuario
      const users: User[] = rows.slice(1)
        .filter(row => row && row.length > 0 && row[0]) // Filtrar filas vacías
        .map(row => {
          const user: User = {
            id: '',
            email: '',
          };

          // Si los headers están mal (no hay password o hay duplicados), usar mapeo posicional
          if (!hasPasswordHeader || createdAtCount > 1) {
            // Mapeo posicional según estructura esperada
            user.id = row[0] || '';
            user.email = (row[1] || '').toLowerCase().trim();
            user.name = row[2] || '';
            user.role = (row[3] || 'member') as 'owner' | 'admin' | 'member';
            user.avatar = row[4] || '';
            user.password = row[5] || ''; // Columna F es password
            user.created_at = row[6] || ''; // Columna G es created_at
          } else {
            // Usar headers normalmente
            headers.forEach((header: string, index: number) => {
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
              }
            });
          }

          return user;
        })
        .filter(user => user.id && user.email); // Solo usuarios válidos con id y email

      console.log(`✅ Loaded ${users.length} users from Google Sheets (spreadsheet: ${spreadsheetId.substring(0, 10)}...)`);
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.name || user.username || 'Sin nombre'}) - Role: ${user.role || 'member'} - Has password: ${!!user.password} ${user.password ? '(length: ' + user.password.length + ')' : ''}`);
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
  },

  async createUser(userData: { email: string; name: string; password: string; role?: string; avatar?: string }): Promise<User> {
    const sheets = await getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const userId = `user-${Date.now()}`;
    const now = new Date().toISOString();

    const newUser = [
      userId,
      userData.email.toLowerCase().trim(),
      userData.name,
      userData.role || 'member',
      userData.avatar || '👤',
      userData.password,
      now
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${USERS_SHEET_NAME}!A:G`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [newUser]
      }
    });

    console.log('✅ User created in Google Sheets:', userId);

    return {
      id: userId,
      email: userData.email.toLowerCase().trim(),
      name: userData.name,
      role: (userData.role || 'member') as 'owner' | 'admin' | 'member',
      avatar: userData.avatar || '👤',
      password: userData.password,
      created_at: now
    };
  }
};
