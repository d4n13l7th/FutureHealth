import Input from '../ui/Input.jsx'
import Select from '../ui/Select.jsx'

const GENDER_OPTIONS = [
    { value: 'male', label: 'Laki-laki' },
    { value: 'female', label: 'Perempuan' },
]

/**
 * PersonalInfoStep
 * ----------------------------------------------------------------
 * Step 1 of 3 in the SimulationForm wizard. Collects demographic
 * data: age, gender, height, weight.
 *
 * Fully controlled by the parent SimulationForm via `formData` and
 * the generic `onChange(field, value)` updater — no internal state.
 *
 * NOTE on field names: `height`/`weight` (not `height_cm`/
 * `weight_kg`) are used to match simulationEngine.js's expected
 * `inputs` shape (calculateBMI(inputs.height, inputs.weight)) and
 * the existing SimulationForm.jsx default values — see Architecture
 * Adjustments.
 *
 * Props:
 * - formData: { age, gender, height, weight, ... }
 * - onChange: (field: string, value: number | string) => void
 * ----------------------------------------------------------------
 */
export default function PersonalInfoStep({ formData, onChange }) {
    return (
        <div className="flex flex-col gap-5">
            <div>
                <label htmlFor="age" className="label-text">
                    Usia
                </label>
                <Input
                    id="age"
                    type="number"
                    min={15}
                    max={120}
                    value={formData.age}
                    onChange={(e) => onChange('age', Number(e.target.value))}
                />
            </div>

            <div>
                <label htmlFor="gender" className="label-text">
                    Jenis Kelamin
                </label>
                <Select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => onChange('gender', e.target.value)}
                    options={GENDER_OPTIONS}
                />
            </div>

            <div>
                <label htmlFor="height" className="label-text">
                    Tinggi Badan
                </label>
                <Input
                    id="height"
                    type="number"
                    min={100}
                    max={250}
                    value={formData.height}
                    onChange={(e) => onChange('height', Number(e.target.value))}
                    rightIcon={<span className="text-sm font-medium">cm</span>}
                />
            </div>

            <div>
                <label htmlFor="weight" className="label-text">
                    Berat Badan
                </label>
                <Input
                    id="weight"
                    type="number"
                    min={30}
                    max={300}
                    value={formData.weight}
                    onChange={(e) => onChange('weight', Number(e.target.value))}
                    rightIcon={<span className="text-sm font-medium">kg</span>}
                />
            </div>
        </div>
    )
}