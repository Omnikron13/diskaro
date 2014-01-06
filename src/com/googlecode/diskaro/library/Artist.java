package com.googlecode.diskaro.library;

import java.sql.SQLException;

public class Artist extends TagCore {
	protected String getTable() {
		return "artists";
	}
	protected String getRelationshipTable() {
		return "artistPseudonyms";
	}
	
	/**
	 * Loads an artist from the database by a specified uid
	 * @param id the internal uid
	 * @throws SQLException
	 */
	public Artist(int id) throws SQLException {
		super(id);
	}
	
	/**
	 * Adds a new artist entry to the database, and returns a corresponding Artist object
	 * that can be used to manipulate the new artist.
	 * @param name name of the new artist to be created
	 * @return Artist object representing the newly added artist
	 */
	public static Artist add(String name) throws SQLException {
		return new Artist(add(name, "artists"));
	}
}
