import { useEffect, useState, useRef } from 'react'
import './AddressSelect.css'

const API_BASE = 'https://provinces.open-api.vn/api'

const provincesCache = { promise: null, data: null }
const districtsCache = new Map()
const wardsCache = new Map()

function loadProvinces() {
    if (provincesCache.data) return Promise.resolve(provincesCache.data)
    if (!provincesCache.promise) {
        provincesCache.promise = fetch(`${API_BASE}/?depth=1`)
            .then((r) => r.json())
            .then((data) => {
                provincesCache.data = data
                return data
            })
            .catch((err) => {
                provincesCache.promise = null
                throw err
            })
    }
    return provincesCache.promise
}

function loadDistricts(provinceCode) {
    if (!provinceCode) return Promise.resolve([])
    const key = String(provinceCode)
    if (districtsCache.has(key)) return Promise.resolve(districtsCache.get(key))
    return fetch(`${API_BASE}/p/${provinceCode}?depth=2`)
        .then((r) => r.json())
        .then((p) => {
            const list = p.districts || []
            districtsCache.set(key, list)
            return list
        })
}

function loadWards(districtCode) {
    if (!districtCode) return Promise.resolve([])
    const key = String(districtCode)
    if (wardsCache.has(key)) return Promise.resolve(wardsCache.get(key))
    return fetch(`${API_BASE}/d/${districtCode}?depth=2`)
        .then((r) => r.json())
        .then((d) => {
            const list = d.wards || []
            wardsCache.set(key, list)
            return list
        })
}

export default function AddressSelect({ value, onChange }) {
    const [provinces, setProvinces] = useState([])
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const initRef = useRef(false)

    useEffect(() => {
        let cancelled = false
        loadProvinces()
            .then((list) => { if (!cancelled) setProvinces(list) })
            .catch(() => { if (!cancelled) setProvinces([]) })
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        let cancelled = false
        if (value.province_code) {
            loadDistricts(value.province_code)
                .then((list) => { if (!cancelled) setDistricts(list) })
                .catch(() => { if (!cancelled) setDistricts([]) })
        } else {
            setDistricts([])
        }
        return () => { cancelled = true }
    }, [value.province_code])

    useEffect(() => {
        let cancelled = false
        if (value.district_code) {
            loadWards(value.district_code)
                .then((list) => { if (!cancelled) setWards(list) })
                .catch(() => { if (!cancelled) setWards([]) })
        } else {
            setWards([])
        }
        return () => { cancelled = true }
    }, [value.district_code])

    useEffect(() => {
        initRef.current = true
    }, [])

    const handleProvinceChange = (e) => {
        const code = e.target.value ? Number(e.target.value) : null
        const found = provinces.find((p) => p.code === code)
        onChange({
            ...value,
            province_code: code,
            province_name: found?.name || '',
            district_code: null,
            district_name: '',
            ward_code: null,
            ward_name: '',
        })
    }

    const handleDistrictChange = (e) => {
        const code = e.target.value ? Number(e.target.value) : null
        const found = districts.find((d) => d.code === code)
        onChange({
            ...value,
            district_code: code,
            district_name: found?.name || '',
            ward_code: null,
            ward_name: '',
        })
    }

    const handleWardChange = (e) => {
        const code = e.target.value ? Number(e.target.value) : null
        const found = wards.find((w) => w.code === code)
        onChange({
            ...value,
            ward_code: code,
            ward_name: found?.name || '',
        })
    }

    const handleStreetChange = (e) => {
        onChange({ ...value, street: e.target.value })
    }

    return (
        <div className="address-select">
            <div className="address-select-row">
                <select
                    value={value.province_code || ''}
                    onChange={handleProvinceChange}
                    aria-label="Tỉnh / Thành phố"
                >
                    <option value="">— Tỉnh / Thành phố —</option>
                    {provinces.map((p) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                </select>

                <select
                    value={value.district_code || ''}
                    onChange={handleDistrictChange}
                    disabled={!value.province_code}
                    aria-label="Quận / Huyện"
                >
                    <option value="">— Quận / Huyện —</option>
                    {districts.map((d) => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                </select>

                <select
                    value={value.ward_code || ''}
                    onChange={handleWardChange}
                    disabled={!value.district_code}
                    aria-label="Phường / Xã"
                >
                    <option value="">— Phường / Xã —</option>
                    {wards.map((w) => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                    ))}
                </select>
            </div>

            <input
                type="text"
                className="address-select-street"
                value={value.street || ''}
                onChange={handleStreetChange}
                placeholder="Số nhà, tên đường (vd: 123 Lê Lợi)"
                maxLength={200}
                autoComplete="street-address"
            />
        </div>
    )
}
