import { useAuth } from '../contexts/AuthContext'
import MemberWallet from './wallet/MemberWallet'
import KiongoziWallet from './wallet/KiongoziWallet'
import AdminWallet from './wallet/AdminWallet'

const Wallet = () => {
  const { user, isAdmin, isKiongozi } = useAuth()

  // Route to appropriate wallet component based on user role
  if (isAdmin()) {
    return <AdminWallet />
  } else if (isKiongozi()) {
    return <KiongoziWallet />
  } else {
    return <MemberWallet />
  }
}

export default Wallet
