import { redirect } from 'next/navigation'

export default function DeprecatedNewUserPage() {
  redirect('/admin/users')
}
