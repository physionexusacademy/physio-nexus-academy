# Creating the first admin account

The admin dashboard checks two things before letting anyone in: a valid Supabase Auth login,
**and** a matching row in the `profiles` table. Signing up alone is not enough — this is
intentional, so a random person can't self-register into the dashboard.

## Steps

1. **Run the schema.** In your Supabase project, open the SQL Editor and run
   `supabase/schema.sql` (then `supabase/storage-setup.md`'s SQL blocks for storage buckets).

2. **Create your login.** Go to **Authentication → Users → Add user** in the Supabase
   Dashboard. Enter your email and set a password directly there (no email confirmation flow
   needed for this first account).

3. **Copy the new user's UUID** from that same Users table.

4. **Grant admin access.** Back in the SQL Editor, run:

   ```sql
   insert into profiles (id, full_name, role)
   values ('paste-the-uuid-here', 'Dr. Sajjad Raza', 'owner');
   ```

5. **Log in.** Visit `/admin/login` on your deployed site (or `http://localhost:3000/admin/login`
   locally) with the email and password from step 2.

That's it — you now have full access to every admin module.

## Adding a second admin later

Once you're logged in, repeat steps 2–4 for any additional staff account, using role `admin`
or `editor` instead of `owner` (the schema allows all three; only `owner` carries any special
meaning to you as a label — enforcement of what each role can do beyond "is an admin" is not
yet built and can be added later if you need tiered permissions).

## If you get locked out

Go to Authentication → Users in the Supabase Dashboard and reset the password directly — no
separate "forgot password" flow has been built yet since there's normally only one or two
admin accounts.
