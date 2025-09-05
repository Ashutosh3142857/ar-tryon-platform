# AR Try-On Platform

A multi-tenant web-based AR (Augmented Reality) try-on application that allows companies to create their own branded AR experiences for customers to virtually try on products like jewelry, shoes, clothes, and furniture.

## Features

### Multi-Tenant Architecture
- **Company Registration**: Each company gets their own tenant account
- **Admin Dashboard**: Complete product management system
- **Tenant Isolation**: Each company's data is completely separate
- **Custom Branding**: Companies can customize their AR experience

### AR Try-On Experience
- **Real-time Camera Access**: Uses device camera for live AR experience
- **Face Detection**: Automatic face landmark detection for precise product positioning
- **Product Categories**: Support for jewelry, shoes, clothes, and furniture
- **Manual Controls**: Users can fine-tune product positioning
- **Photo Capture**: Save AR try-on photos

### Admin Panel
- **Authentication**: Secure JWT-based login system
- **Product Management**: Add, edit, delete products with images
- **File Upload**: Cloud storage integration for product images
- **Analytics Dashboard**: View product statistics and usage
- **Multi-format Support**: Handle various product types and specifications

### Technical Features
- **PostgreSQL Database**: Robust multi-tenant data storage
- **Object Storage**: Scalable cloud storage for product images
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Processing**: Live face detection and AR overlay
- **RESTful API**: Clean API design for frontend-backend communication

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **TanStack Query** for server state management
- **Wouter** for routing
- **face-api.js** for face detection

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for database operations
- **JWT** for authentication
- **bcrypt** for password hashing
- **Google Cloud Storage** for file uploads

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── types/          # TypeScript type definitions
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts               # Database connection
│   └── objectStorage.ts    # File upload handling
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 18 or later
- PostgreSQL database
- Google Cloud Storage (for file uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ar-tryon-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Database
DATABASE_URL=your_postgresql_connection_string

# Object Storage
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your_bucket_id
PUBLIC_OBJECT_SEARCH_PATHS=your_public_paths
PRIVATE_OBJECT_DIR=your_private_directory

# Authentication
JWT_SECRET=your_jwt_secret
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Usage

### For Companies (Admin Users)

1. **Register Your Company**:
   - Go to `/admin/register`
   - Fill in company details and create admin account
   - Get automatically logged in to dashboard

2. **Manage Products**:
   - Access admin dashboard at `/admin/dashboard`
   - Add products with images and specifications
   - Upload product photos and AR overlay images
   - Set pricing, categories, and availability

3. **Share AR Experience**:
   - Your unique AR link: `/ar/your-company-slug`
   - Share this link with customers
   - Customers can try on your products in real-time

### For Customers

1. **Access AR Experience**:
   - Visit company's AR link (e.g., `/ar/company-name`)
   - Allow camera access when prompted
   - Browse available product categories

2. **Try On Products**:
   - Select a product from the carousel
   - See real-time AR overlay on your face
   - Use manual controls to adjust positioning
   - Capture photos of your try-on experience

## API Endpoints

### Public Endpoints
- `GET /api/:tenantSlug/products` - Get all products for a tenant
- `GET /api/:tenantSlug/products/category/:category` - Get products by category
- `POST /api/:tenantSlug/try-on-sessions` - Save try-on session data

### Admin Endpoints (Protected)
- `POST /api/admin/register` - Register new company and admin user
- `POST /api/admin/login` - Admin login
- `GET /api/admin/products` - Get admin's products
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/upload` - Get upload URL for product images

## Database Schema

### Key Tables
- **tenants**: Company information and settings
- **admin_users**: Admin user accounts for each company
- **products**: Product catalog with AR specifications
- **try_on_sessions**: Customer try-on session data
- **product_analytics**: Usage statistics and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.