"use client";

import { useState, useEffect } from 'react';
import { CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PurchaseItem {
    id: string;
    quantity: string;
    description: string;
    estimatedUnitPrice: string;
    estimatedTotalPrice: string;
}

export interface PurchaseRequestFormData {
    selectedPPA: string;
    activityName: string;
    activityDescription: string;
    targetBeneficiaries: string;
    purchaseItems: PurchaseItem[];
    totalPRAmount: string;
    responsibleCommittee: string;
    relatedPR: string;
    authorizer: string;
    budgetAvailabilityConfirmed: boolean;
}

interface PurchaseRequestFormProps {
    isCompleted: boolean;
    onGenerate: (formData: PurchaseRequestFormData) => void;
    isGenerating?: boolean;
}

export default function PurchaseRequestForm({ isCompleted, onGenerate, isGenerating = false }: PurchaseRequestFormProps) {
    // Purchase Request Form fields
    const [selectedPPA, setSelectedPPA] = useState('');
    const [activityName, setActivityName] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const [targetBeneficiaries, setTargetBeneficiaries] = useState('');
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
        { id: '1', quantity: '', description: '', estimatedUnitPrice: '', estimatedTotalPrice: '' }
    ]);
    const [totalPRAmount, setTotalPRAmount] = useState('');
    const [responsibleCommittee, setResponsibleCommittee] = useState('');

    // PR Authorization Form fields
    const [relatedPR, setRelatedPR] = useState('');
    const [authorizer, setAuthorizer] = useState('');
    const [budgetAvailabilityConfirmed, setBudgetAvailabilityConfirmed] = useState(false);

    // Sample options
    const abyipOptions = [
        'PPA 1.1 - Infrastructure Development',
        'PPA 1.2 - Capacity Building',
        'PPA 2.1 - Community Outreach',
        'PPA 2.2 - Educational Programs',
        'PPA 3.1 - Healthcare Initiatives',
        'PPA 3.2 - Youth Development'
    ];

    const existingPRs = [
        'PR-2025-001 - Community Center Equipment',
        'PR-2025-002 - Youth Program Supplies',
        'PR-2025-003 - Healthcare Initiative Materials',
        'PR-2025-004 - Educational Workshop Resources'
    ];

    const authorizerOptions = [
        'SK Chair',
        'Bids & Awards Committee'
    ];

    const addPurchaseItem = () => {
        const newItem: PurchaseItem = {
            id: Date.now().toString(),
            quantity: '',
            description: '',
            estimatedUnitPrice: '',
            estimatedTotalPrice: ''
        };
        setPurchaseItems([...purchaseItems, newItem]);
    };

    const removePurchaseItem = (id: string) => {
        if (purchaseItems.length > 1) {
            setPurchaseItems(purchaseItems.filter(item => item.id !== id));
        }
    };

    const updatePurchaseItem = (id: string, field: keyof PurchaseItem, value: string) => {
        setPurchaseItems(items =>
            items.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };

                    // Auto-calculate total price when quantity or unit price changes
                    if (field === 'quantity' || field === 'estimatedUnitPrice') {
                        const qty = parseFloat(field === 'quantity' ? value : updatedItem.quantity) || 0;
                        const unitPrice = parseFloat(field === 'estimatedUnitPrice' ? value : updatedItem.estimatedUnitPrice) || 0;
                        updatedItem.estimatedTotalPrice = (qty * unitPrice).toFixed(2);
                    }

                    return updatedItem;
                }
                return item;
            })
        );
    };

    const calculateTotalAmount = () => {
        const total = purchaseItems.reduce((sum, item) => {
            return sum + (parseFloat(item.estimatedTotalPrice) || 0);
        }, 0);
        setTotalPRAmount(total.toFixed(2));
    };

    useEffect(() => {
        calculateTotalAmount();
    }, [purchaseItems]);

    const handleGenerate = () => {
        // Validate required fields
        if (!selectedPPA || !activityName || !activityDescription || !targetBeneficiaries ||
            !responsibleCommittee || !relatedPR || !authorizer || !budgetAvailabilityConfirmed) {
            alert('Please fill in all required fields before generating the document.');
            return;
        }

        if (!purchaseItems.some(item => item.description.trim())) {
            alert('Please add at least one purchase item.');
            return;
        }

        const formData: PurchaseRequestFormData = {
            selectedPPA,
            activityName,
            activityDescription,
            targetBeneficiaries,
            purchaseItems,
            totalPRAmount,
            responsibleCommittee,
            relatedPR,
            authorizer,
            budgetAvailabilityConfirmed
        };

        onGenerate(formData);
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <span>Purchase Request (PR) Form</span>
                    {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Fill in the required information for your purchase request
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* ABYIP-aligned PPA/Activity */}
                <div>
                    <label htmlFor="ppa" className="block text-sm font-medium text-foreground mb-2">
                        Select ABYIP-aligned PPA/Activity <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="ppa"
                        value={selectedPPA}
                        onChange={(e) => setSelectedPPA(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        required
                    >
                        <option value="">Select an option...</option>
                        {abyipOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* Activity Name and Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="activityName" className="block text-sm font-medium text-foreground mb-2">
                            Activity Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="activityName"
                            type="text"
                            value={activityName}
                            onChange={(e) => setActivityName(e.target.value)}
                            placeholder="Enter activity name..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="activityDescription" className="block text-sm font-medium text-foreground mb-2">
                            Brief Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="activityDescription"
                            rows={3}
                            value={activityDescription}
                            onChange={(e) => setActivityDescription(e.target.value)}
                            placeholder="Brief description of the activity..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                            required
                        />
                    </div>
                </div>

                {/* Target Beneficiaries */}
                <div>
                    <label htmlFor="beneficiaries" className="block text-sm font-medium text-foreground mb-2">
                        Target Beneficiaries/Participants <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="beneficiaries"
                        rows={3}
                        value={targetBeneficiaries}
                        onChange={(e) => setTargetBeneficiaries(e.target.value)}
                        placeholder="Describe the target beneficiaries or participants..."
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                        required
                    />
                </div>

                {/* Itemized List */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-foreground">
                            Itemized List of Items to be Purchased <span className="text-red-500">*</span>
                        </label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addPurchaseItem}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {purchaseItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 border border-input rounded-md">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updatePurchaseItem(item.id, 'quantity', e.target.value)}
                                        placeholder="Qty"
                                        className="w-full px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updatePurchaseItem(item.id, 'description', e.target.value)}
                                        placeholder="Item description"
                                        className="w-full px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Unit Price (₱)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.estimatedUnitPrice}
                                        onChange={(e) => updatePurchaseItem(item.id, 'estimatedUnitPrice', e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-2 py-1 text-sm border border-input rounded focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                                        Total Price (₱)
                                    </label>
                                    <input
                                        type="text"
                                        value={item.estimatedTotalPrice}
                                        readOnly
                                        className="w-full px-2 py-1 text-sm border border-input rounded bg-muted"
                                    />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                    {purchaseItems.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removePurchaseItem(item.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="totalAmount" className="block text-sm font-medium text-foreground mb-2">
                            Requested Total PR Amount (₱) <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="totalAmount"
                            type="text"
                            value={totalPRAmount}
                            readOnly
                            className="w-full px-3 py-2 border border-input rounded-md bg-muted font-semibold"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Auto-calculated from itemized list
                        </p>
                    </div>
                    <div>
                        <label htmlFor="committee" className="block text-sm font-medium text-foreground mb-2">
                            Committee Responsible for Oversight <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="committee"
                            type="text"
                            value={responsibleCommittee}
                            onChange={(e) => setResponsibleCommittee(e.target.value)}
                            placeholder="Enter committee name..."
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                            required
                        />
                    </div>
                </div>

                {/* PR Authorization Form Section */}
                <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-foreground mb-4">PR Authorization Form</h3>

                    <div className="space-y-4">
                        {/* Related Purchase Request */}
                        <div>
                            <label htmlFor="relatedPR" className="block text-sm font-medium text-foreground mb-2">
                                Select Related Purchase Request (PR) <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="relatedPR"
                                value={relatedPR}
                                onChange={(e) => setRelatedPR(e.target.value)}
                                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                                required
                            >
                                <option value="">Select a Purchase Request...</option>
                                {existingPRs.map((pr, index) => (
                                    <option key={index} value={pr}>{pr}</option>
                                ))}
                            </select>
                        </div>

                        {/* Authorizer */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">
                                Who authorizes this PR? <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                {authorizerOptions.map((option) => (
                                    <label key={option} className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="authorizer"
                                            value={option}
                                            checked={authorizer === option}
                                            onChange={(e) => setAuthorizer(e.target.value)}
                                            className="h-4 w-4 text-primary border-input focus:ring-2 focus:ring-ring"
                                            required
                                        />
                                        <span className="text-sm text-foreground">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Budget Availability Confirmation */}
                        <div>
                            <label className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    checked={budgetAvailabilityConfirmed}
                                    onChange={(e) => setBudgetAvailabilityConfirmed(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-primary border-input rounded focus:ring-2 focus:ring-ring"
                                    required
                                />
                                <div>
                                    <span className="text-sm font-medium text-foreground">
                                        Confirm budget availability based on ABYIP <span className="text-red-500">*</span>
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        I confirm that the budget is available for this purchase request according to the approved ABYIP allocation.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <div className="pt-4 border-t">
                    <Button
                        className="w-full"
                        variant="default"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating with AI...
                            </>
                        ) : (
                            'Generate Purchase Request Document'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}