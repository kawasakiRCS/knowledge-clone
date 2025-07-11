import type { NextApiRequest, NextApiResponse } from 'next';

interface User {
  userId: number;
  userName: string;
}

// モックデータ
const mockUsers: User[] = [
  { userId: 1, userName: 'admin' },
  { userId: 2, userName: 'user1' },
  { userId: 3, userName: 'user2' },
  { userId: 4, userName: 'developer1' },
  { userId: 5, userName: 'developer2' },
  { userId: 6, userName: 'designer1' },
  { userId: 7, userName: 'tester1' },
  { userId: 8, userName: 'manager1' },
  { userId: 9, userName: 'support1' },
  { userId: 10, userName: 'guest1' },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<User[]>
) {
  if (req.method === 'GET') {
    const { keyword, offset } = req.query;
    const pageSize = 10;
    const page = parseInt(offset as string) || 0;
    
    // キーワードでフィルタ
    let filteredUsers = mockUsers;
    if (keyword && typeof keyword === 'string') {
      filteredUsers = mockUsers.filter(user => 
        user.userName.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    
    // ページング
    const start = page * pageSize;
    const end = start + pageSize;
    const pagedUsers = filteredUsers.slice(start, end);
    
    res.status(200).json(pagedUsers);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}