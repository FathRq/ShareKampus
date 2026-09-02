package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// CampusLocation merepresentasikan satu baris dari tabel campus_locations,
// digabung dengan nama institusi induknya (lewat JOIN)
type CampusLocation struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	CampusName  string  `json:"campus_name"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	RadiusMeter int     `json:"radius_meter"`
}

type CampusLocationRepository struct {
	db *pgxpool.Pool
}

func NewCampusLocationRepository(db *pgxpool.Pool) *CampusLocationRepository {
	return &CampusLocationRepository{db: db}
}

// ListByCampusID mengambil semua lokasi fisik milik satu institusi
// (dipakai untuk dropdown pilihan saat mahasiswa mendaftar)
func (r *CampusLocationRepository) ListByCampusID(ctx context.Context, campusID string) ([]CampusLocation, error) {
	query := `
		SELECT
			cl.id,
			cl.name,
			c.name AS campus_name,
			ST_Y(cl.location::geometry) AS latitude,
			ST_X(cl.location::geometry) AS longitude,
			cl.radius_meter
		FROM campus_locations cl
		JOIN campuses c ON c.id = cl.campus_id
		WHERE cl.campus_id = $1
		ORDER BY cl.name ASC
	`

	rows, err := r.db.Query(ctx, query, campusID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locations []CampusLocation
	for rows.Next() {
		var loc CampusLocation
		if err := rows.Scan(&loc.ID, &loc.Name, &loc.CampusName, &loc.Latitude, &loc.Longitude, &loc.RadiusMeter); err != nil {
			return nil, err
		}
		locations = append(locations, loc)
	}

	return locations, rows.Err()
}

// ListAll mengambil SEMUA lokasi kampus dari semua institusi.
// Untuk MVP (cuma 1 institusi/UNESA), ini cukup dipakai langsung
// untuk dropdown pilihan kampus saat mahasiswa mendaftar.
func (r *CampusLocationRepository) ListAll(ctx context.Context) ([]CampusLocation, error) {
	query := `
		SELECT
			cl.id,
			cl.name,
			c.name AS campus_name,
			ST_Y(cl.location::geometry) AS latitude,
			ST_X(cl.location::geometry) AS longitude,
			cl.radius_meter
		FROM campus_locations cl
		JOIN campuses c ON c.id = cl.campus_id
		ORDER BY c.name ASC, cl.name ASC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locations []CampusLocation
	for rows.Next() {
		var loc CampusLocation
		if err := rows.Scan(&loc.ID, &loc.Name, &loc.CampusName, &loc.Latitude, &loc.Longitude, &loc.RadiusMeter); err != nil {
			return nil, err
		}
		locations = append(locations, loc)
	}

	return locations, rows.Err()
}
