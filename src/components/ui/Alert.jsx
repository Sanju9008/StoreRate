import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Alert({ type = 'info', message }) {
    if (!message) return null;

    const styles = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error:   'bg-red-50 text-red-800 border-red-200',
        info:    'bg-blue-50 text-blue-800 border-blue-200'
    };

    const Icon = { success: CheckCircle2, error: AlertCircle, info: Info }[type];

    return (
        <div className={`rounded-lg border p-4 mb-4 ${styles[type]}`}>
            <div className="flex items-start">
                <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="ml-3 flex-1 text-sm font-medium">{message}</div>
            </div>
        </div>
    );
}
