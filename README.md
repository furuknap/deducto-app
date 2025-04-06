# Deducto - Expense Tracking Application

Deducto is a bilingual (English/Spanish) expense tracking application that helps you monitor and manage your personal or business expenses. Track spending across different categories, view expense breakdowns, and gain insights into your financial habits.

## Features

- **Expense Tracking**: Record and manage your expenses with descriptions, amounts, and categories
- **Category Management**: Create and organize custom expense categories
- **Dashboard Visualization**: View expense breakdowns with intuitive charts
- **Bilingual Support**: Full English and Spanish language support
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase Postgres
- **Data Visualization**: Recharts

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or another package manager
- A Supabase account

### Setting Up Supabase

1. **Create a Supabase Account**:
   - Go to [https://supabase.com](https://supabase.com) and sign up for a free account
   - Create a new project and note your project URL and anon/public key

2. **Set Up Database Tables**:
   - In the Supabase dashboard, navigate to the SQL Editor
   - Create the necessary tables by running the following SQL:

   ```sql
   -- Create categories table
   CREATE TABLE public.categories (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   );

   -- Create expenses table
   CREATE TABLE public.expenses (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     description TEXT NOT NULL,
     amount NUMERIC NOT NULL,
     category_id UUID REFERENCES public.categories(id),
     date DATE NOT NULL DEFAULT CURRENT_DATE,
     count INTEGER NOT NULL DEFAULT 1,
     user_id UUID NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
   );

   -- Enable Row Level Security
   ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies for expenses
   CREATE POLICY "Users can view their own expenses"
     ON public.expenses
     FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can create their own expenses"
     ON public.expenses
     FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own expenses"
     ON public.expenses
     FOR UPDATE
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own expenses"
     ON public.expenses
     FOR DELETE
     USING (auth.uid() = user_id);
   ```

3. **Configure Authentication**:
   - In the Supabase dashboard, go to Authentication → Settings
   - Configure Email Auth (recommended: disable email confirmation for testing)
   - Set up any additional authentication providers if needed

### Local Development

1. **Clone the repository**:
   ```sh
   git clone <your-repo-url>
   cd deducto
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Update Supabase Configuration**:
   - Locate the `src/integrations/supabase/client.ts` file
   - Replace the Supabase URL and anon key with your own values from your Supabase project

4. **Start the development server**:
   ```sh
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:5173` to see the application running.

## Usage

1. **Create an Account**: Sign up with your email and password
2. **Add Categories**: Set up expense categories that make sense for your budget
3. **Record Expenses**: Add new expenses with descriptions, amounts, and categories
4. **View Analytics**: Use the dashboard to see spending patterns and breakdowns

## Deployment

To deploy this project:

1. Build the production version:
   ```sh
   npm run build
   ```

2. Deploy the contents of the `dist` directory to your preferred hosting service (Netlify, Vercel, GitHub Pages, etc.)

3. Ensure your Supabase project is properly configured for production use:
   - Review and restrict CORS settings
   - Enable email confirmation for authentication
   - Set up additional security as needed

## License

This project is open source and available under the [MIT License](LICENSE).

## Database Setup

### Categories Table Migration

If you're setting up a new project or upgrading an existing one, run the following SQL commands in the Supabase SQL Editor to add user-specific permissions to the categories table:

```sql
-- Add user_id column to categories table
ALTER TABLE public.categories 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable Row Level Security on the categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own categories
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy to allow users to create their own categories
CREATE POLICY "Users can create their own categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own categories
CREATE POLICY "Users can update their own categories" 
ON public.categories 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own categories
CREATE POLICY "Users can delete their own categories" 
ON public.categories 
FOR DELETE 
USING (auth.uid() = user_id);
```

These SQL commands will:
- Add a `user_id` column to the categories table
- Enable Row Level Security
- Create policies to ensure users can only interact with their own categories
