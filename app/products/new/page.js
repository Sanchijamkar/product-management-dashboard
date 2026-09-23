import AppHeader from '../../../components/AppHeader';
import ProductForm from '../../../components/ProductForm';
import RequireAuth from '../../../components/RequireAuth';

export default function NewProductPage() {
  return <RequireAuth><AppHeader /><ProductForm mode="add" /></RequireAuth>;
}
