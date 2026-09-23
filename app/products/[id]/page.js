import AppHeader from '../../../components/AppHeader';
import ProductDetails from '../../../components/ProductDetails';
import RequireAuth from '../../../components/RequireAuth';

export default function ProductPage() {
  return <RequireAuth><AppHeader /><ProductDetails /></RequireAuth>;
}
