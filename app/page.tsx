'use client'

import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import Map, { 
  Marker, 
  Popup, 
  GeolocateControl, 
  NavigationControl, 
  ScaleControl,
  FullscreenControl,
  Source,
  Layer
} from 'react-map-gl'
import { clsx } from 'clsx'

// Type definitions
interface LocationData {
  id: number
  name: string
  longitude: number
  latitude: number
  overallScore: number
  categories: {
    safety: CategoryScore
    hygiene: CategoryScore
    reputation: CategoryScore
    trust: CategoryScore
  }
  reviewCount: number
  lastUpdated: string
  address?: string
  description?: string
  type: 'restaurant' | 'park' | 'transit' | 'office' | 'retail'
}

interface CategoryScore {
  score: number
  status: 'excellent' | 'good' | 'fair' | 'caution'
}

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch: number
  bearing: number
}

// Enhanced UI Components with animations
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default',
  size = 'default',
  className = '',
  ...props 
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost' | 'satellite'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  [key: string]: any
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
    satellite: "bg-green-600 text-white hover:bg-green-700 shadow-md"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base"
  }

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  onKeyPress, 
  className = '',
  ...props 
}: {
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress?: (e: React.KeyboardEvent) => void
  className?: string
  [key: string]: any
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      className={clsx(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
        "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      {...props}
    />
  )
}

const Card = ({ children, className = '', ...props }: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  return (
    <div 
      className={clsx("rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200", className)} 
      {...props}
    >
      {children}
    </div>
  )
}

const Badge = ({ children, variant = 'default', className = '', ...props }: {
  children: React.ReactNode
  variant?: 'default' | 'excellent' | 'good' | 'fair' | 'caution'
  className?: string
  [key: string]: any
}) => {
  const variants = {
    default: "bg-blue-600 text-white",
    excellent: "bg-green-600 text-white",
    good: "bg-blue-600 text-white", 
    fair: "bg-yellow-600 text-white",
    caution: "bg-red-600 text-white"
  }

  return (
    <div 
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

// Enhanced SVG Icons
const SearchIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const MapPinIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ShieldIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const SatelliteIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m8-9l2-2m0 0l2-2m-2 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2h6l2-2z" />
  </svg>
)

const LayersIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16l-2 12H6L4 6zM4 6l2-2h12l2 2" />
  </svg>
)

const CheckCircleIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertTriangleIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const XCircleIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Enhanced mock data with more locations
const mockLocations: LocationData[] = [
  {
    id: 1,
    name: "Downtown Coffee Shop",
    longitude: -74.006,
    latitude: 40.7128,
    overallScore: 8.5,
    address: "123 Broadway, New York, NY",
    description: "Popular artisan coffee shop with excellent reviews",
    type: 'restaurant',
    categories: {
      safety: { score: 9.2, status: 'excellent' },
      hygiene: { score: 8.1, status: 'good' },
      reputation: { score: 8.3, status: 'good' },
      trust: { score: 8.5, status: 'good' }
    },
    reviewCount: 1247,
    lastUpdated: '2 hours ago'
  },
  {
    id: 2,
    name: "Metro Station Plaza",
    longitude: -74.008,
    latitude: 40.7158,
    overallScore: 6.2,
    address: "456 7th Ave, New York, NY",
    description: "Busy transit hub with mixed safety reviews",
    type: 'transit',
    categories: {
      safety: { score: 5.8, status: 'caution' },
      hygiene: { score: 6.5, status: 'fair' },
      reputation: { score: 6.4, status: 'fair' },
      trust: { score: 6.1, status: 'fair' }
    },
    reviewCount: 892,
    lastUpdated: '4 hours ago'
  },
  {
    id: 3,
    name: "Riverside Park",
    longitude: -73.989,
    latitude: 40.7242,
    overallScore: 9.1,
    address: "Riverside Dr, New York, NY",
    description: "Beautiful waterfront park with excellent safety record",
    type: 'park',
    categories: {
      safety: { score: 9.5, status: 'excellent' },
      hygiene: { score: 8.9, status: 'good' },
      reputation: { score: 9.2, status: 'excellent' },
      trust: { score: 8.8, status: 'good' }
    },
    reviewCount: 2156,
    lastUpdated: '1 hour ago'
  },
  {
    id: 4,
    name: "Tech Hub Coworking",
    longitude: -74.012,
    latitude: 40.7089,
    overallScore: 8.8,
    address: "789 Innovation St, New York, NY",
    description: "Modern coworking space with top-tier amenities",
    type: 'office',
    categories: {
      safety: { score: 9.0, status: 'excellent' },
      hygiene: { score: 8.9, status: 'good' },
      reputation: { score: 8.7, status: 'good' },
      trust: { score: 8.6, status: 'good' }
    },
    reviewCount: 543,
    lastUpdated: '30 minutes ago'
  },
  {
    id: 5,
    name: "Brooklyn Bridge Walkway",
    longitude: -73.9969,
    latitude: 40.7061,
    overallScore: 8.2,
    address: "Brooklyn Bridge, New York, NY",
    description: "Iconic pedestrian walkway with stunning city views",
    type: 'park',
    categories: {
      safety: { score: 8.0, status: 'good' },
      hygiene: { score: 8.1, status: 'good' },
      reputation: { score: 8.5, status: 'good' },
      trust: { score: 8.2, status: 'good' }
    },
    reviewCount: 3421,
    lastUpdated: '3 hours ago'
  },
  {
    id: 6,
    name: "SoHo Shopping District",
    longitude: -74.0020,
    latitude: 40.7233,
    overallScore: 7.8,
    address: "SoHo, New York, NY",
    description: "Trendy shopping area with boutiques and galleries",
    type: 'retail',
    categories: {
      safety: { score: 7.5, status: 'good' },
      hygiene: { score: 8.0, status: 'good' },
      reputation: { score: 8.2, status: 'good' },
      trust: { score: 7.6, status: 'good' }
    },
    reviewCount: 1876,
    lastUpdated: '5 hours ago'
  }
]

// Utility functions
const getScoreColor = (score: number): string => {
  if (score >= 8.5) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (score >= 5.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

const getScoreIcon = (status: string) => {
  const iconProps = { className: "h-4 w-4" }
  switch (status) {
    case 'excellent': return <CheckCircleIcon {...iconProps} />
    case 'good': return <ShieldIcon {...iconProps} />
    case 'fair': return <AlertTriangleIcon {...iconProps} />
    case 'caution': return <XCircleIcon {...iconProps} />
    default: return <MapPinIcon {...iconProps} />
  }
}

const getMarkerColor = (score: number): string => {
  if (score >= 8.5) return '#16a34a' // green-600
  if (score >= 7.0) return '#2563eb' // blue-600
  if (score >= 5.5) return '#ca8a04' // yellow-600
  return '#dc2626' // red-600
}

const getBadgeVariant = (status: string): 'excellent' | 'good' | 'fair' | 'caution' => {
  return status as 'excellent' | 'good' | 'fair' | 'caution'
}

// Map styles
const mapStyles = {
  street: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12',
  dark: 'mapbox://styles/mapbox/dark-v11'
}

// Main Enhanced MapJitsu Application
export default function MapJitsu() {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 13,
    pitch: 45,
    bearing: 0
  })
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [mapStyle, setMapStyle] = useState(mapStyles.street)
  const [show3D, setShow3D] = useState(true)
  const mapRef = useRef<any>()

  // Memoized calculations
  const averageScore = useMemo(() => {
    const total = mockLocations.reduce((sum, location) => sum + location.overallScore, 0)
    return (total / mockLocations.length).toFixed(1)
  }, [])

  const totalSignals = useMemo(() => {
    return mockLocations.reduce((sum, location) => sum + location.reviewCount, 0)
  }, [])

  // Initialize map with terrain
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap()
      map.on('style.load', () => {
        map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        })
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 })
      })
    }
  }, [mapStyle])

  // Event handlers
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    
    setTimeout(() => {
      const searchResult = mockLocations.find(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address?.toLowerCase().includes(query.toLowerCase()) ||
        location.type.toLowerCase().includes(query.toLowerCase())
      )
      
      if (searchResult) {
        setViewState(prev => ({
          ...prev,
          longitude: searchResult.longitude,
          latitude: searchResult.latitude,
          zoom: 16,
          pitch: 60,
          bearing: 0
        }))
        setSelectedLocation(searchResult)
      } else {
        setViewState(prev => ({
          ...prev,
          longitude: -74.006,
          latitude: 40.7128,
          zoom: 13
        }))
      }
      setIsSearching(false)
    }, 1000)
  }, [])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchValue)
    }
  }, [searchValue, handleSearch])

  const handleMarkerClick = useCallback((location: LocationData, e: any) => {
    e.originalEvent.stopPropagation()
    setSelectedLocation(location)
    setViewState(prev => ({
      ...prev,
      longitude: location.longitude,
      latitude: location.latitude,
      zoom: 16,
      pitch: 60,
      bearing: 0
    }))
  }, [])

  const toggleMapStyle = useCallback(() => {
    setMapStyle(current => 
      current === mapStyles.street ? mapStyles.satellite : 
      current === mapStyles.satellite ? mapStyles.terrain :
      mapStyles.street
    )
  }, [])

  const toggle3D = useCallback(() => {
    setShow3D(prev => !prev)
    setViewState(prev => ({
      ...prev,
      pitch: show3D ? 0 : 45,
      bearing: show3D ? 0 : -17.6
    }))
  }, [show3D])

  // Create GeoJSON for route lines between markers
  const routeData = useMemo(() => ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: mockLocations.map(loc => [loc.longitude, loc.latitude])
    }
  }), [])

  const routeLayerStyle = {
    id: 'route',
    type: 'line' as const,
    paint: {
      'line-color': '#2563eb',
      'line-width': 3,
      'line-opacity': 0.6
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Enhanced Sidebar */}
      <div className="w-96 bg-white shadow-xl flex flex-col border-r">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <ShieldIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MapJitsu</h1>
              <p className="text-xs text-gray-600">3D Location Intelligence</p>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4">
            AI-powered insights with 3D terrain visualization
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <Input
              placeholder="Search locations, addresses, types..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-20"
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <Button
                onClick={() => handleSearch(searchValue)}
                disabled={isSearching}
                size="sm"
                className="h-8"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </div>

          {/* Map Controls */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={toggleMapStyle}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <SatelliteIcon className="h-3 w-3" />
              {mapStyle === mapStyles.street ? 'Satellite' : 
               mapStyle === mapStyles.satellite ? 'Terrain' : 'Street'}
            </Button>
            <Button
              onClick={toggle3D}
              variant={show3D ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-1"
            >
              <LayersIcon className="h-3 w-3" />
              {show3D ? '3D' : '2D'}
            </Button>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 bg-white/80 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{averageScore}</div>
              <div className="text-xs text-gray-600">Avg Score</div>
            </div>
            <div className="text-center p-2 bg-white/80 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{mockLocations.length}</div>
              <div className="text-xs text-gray-600">Locations</div>
            </div>
            <div className="text-center p-2 bg-white/80 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{totalSignals.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Signals</div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedLocation ? (
            <div className="space-y-6">
              {/* Location Header */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedLocation.name}
                </h2>
                <p className="text-sm text-gray-600 mb-2 capitalize">
                  {selectedLocation.type} • {selectedLocation.address}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedLocation.description}
                </p>
                
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="default" className="text-lg font-bold px-4 py-2">
                    {selectedLocation.overallScore}/10
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <div>{selectedLocation.reviewCount.toLocaleString()} signals</div>
                    <div>Updated {selectedLocation.lastUpdated}</div>
                  </div>
                </div>
              </div>

              {/* Enhanced Category Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Safety Analysis
                </h3>
                
                <div className="grid gap-3">
                  {Object.entries(selectedLocation.categories).map(([category, data], index) => (
                    <Card 
                      key={category} 
                      className="p-4 border-l-4 hover:shadow-md transition-all duration-200"
                      style={{ 
                        borderLeftColor: getMarkerColor(data.score),
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-full bg-gray-50">
                            {getScoreIcon(data.status)}
                          </div>
                          <div>
                            <span className="font-medium capitalize text-gray-900">
                              {category}
                            </span>
                            <div className="text-xs text-gray-500 capitalize">
                              {data.status} rating
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={getBadgeVariant(data.status)}
                          className="font-semibold"
                        >
                          {data.score}/10
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t space-y-2">
                <div className="text-xs text-gray-500">
                  📊 Data sources: Public records, user reports, AI analysis
                </div>
                <div className="text-xs text-gray-500">
                  🔄 Last verification: {selectedLocation.lastUpdated}
                </div>
                <div className="text-xs text-gray-500">
                  🗺️ Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              <div className="p-4 rounded-full bg-gray-100 w-fit mx-auto mb-4">
                <MapPinIcon className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium mb-2 text-gray-900">Explore 3D Locations</p>
              <p className="text-sm leading-relaxed mb-6">
                Click on any 3D marker to view detailed safety insights, or search for specific locations and types.
              </p>
              
              {/* Enhanced Featured Locations */}
              <div className="text-left">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Featured Locations:</h4>
                <div className="space-y-2">
                  {mockLocations.slice(0, 4).map((location) => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setViewState(prev => ({
                          ...prev,
                          longitude: location.longitude,
                          latitude: location.latitude,
                          zoom: 16,
                          pitch: 60
                        }))
                        setSelectedLocation(location)
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-100"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900 block">
                            {location.name}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {location.type}
                          </span>
                        </div>
                        <Badge 
                          variant={getBadgeVariant(location.categories.safety.status)}
                          className="text-xs"
                        >
                          {location.overallScore}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced 3D Map Container */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle={mapStyle}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
          terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
          fog={{
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
          }}
        >
          {/* Enhanced Map Controls */}
          <NavigationControl position="top-right" showCompass showZoom />
          <GeolocateControl position="top-right" />
          <FullscreenControl position="top-right" />
          <ScaleControl position="bottom-right" />

          {/* Route Lines */}
          <Source id="route" type="geojson" data={routeData}>
            <Layer {...routeLayerStyle} />
          </Source>

          {/* Enhanced 3D Location Markers */}
          {mockLocations.map((location) => (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              onClick={(e) => handleMarkerClick(location, e)}
            >
              <div className="relative group cursor-pointer">
                {/* Main Marker */}
                <div 
                  className="w-10 h-10 rounded-full border-4 border-white shadow-xl transition-all duration-300 group-hover:scale-125 group-hover:shadow-2xl relative overflow-hidden"
                  style={{ backgroundColor: getMarkerColor(location.overallScore) }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                  <div className="absolute inset-2 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {location.overallScore}
                    </span>
                  </div>
                </div>
                
                {/* Pulse animation for selected marker */}
                {selectedLocation?.id === location.id && (
                  <div className="absolute inset-0">
                    <div 
                      className="w-10 h-10 rounded-full animate-ping"
                      style={{ backgroundColor: getMarkerColor(location.overallScore) }}
                    ></div>
                  </div>
                )}

                {/* 3D Tower Effect */}
                <div 
                  className="absolute bottom-0 left-1/2 transform
