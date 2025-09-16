import AddPageForm from './AddPageForm';
import PageList from './PageList';

const Dashboard = ({ pages, setPages, setCurrentPage, setShowEditor }) => (
  <div className="p-4">
    <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <AddPageForm 
          pages={pages} 
          setPages={setPages} 
          setCurrentPage={setCurrentPage} 
          setShowEditor={setShowEditor} 
        />
      </div>
      <div>
        <PageList 
          pages={pages} 
          setCurrentPage={setCurrentPage} 
          setShowEditor={setShowEditor} 
        />
      </div>
    </div>
  </div>
);

export default Dashboard;
