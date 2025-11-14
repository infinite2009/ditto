import { NewProjectModal, NewProjectFormData } from './new-project-modal';

interface CreateProjectModalProps {
  onOk: (payload: NewProjectFormData) => void;
  onCancel: () => void;
}

export const CreateProjectModal = ({ onOk, onCancel }: CreateProjectModalProps) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div style={{ width: 540, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <NewProjectModal visible={true} onOk={onOk} onCancel={onCancel}/>
      </div>
    </div>
  );
};
