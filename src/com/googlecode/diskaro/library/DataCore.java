/**
 * 
 */
package com.googlecode.diskaro.library;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;

/**
 * @author S4T4N
 * Core logic & structure shared by all objects that represent database entries
 * that have an id & name.
 */
public abstract class DataCore {
	//Internal database uid
	protected int id;
	//Human readable name
	protected String name;
	
	/**
	 * Return the UID used by the library database.
	 * @return the UID
	 */
	public int getID() {
		return this.id;
	}
	
	/**
	 * Return the human-readable name.
	 * @return the name
	 */
	public String getName() {
		return this.name;
	}
	
	/**
	 * @see getName()
	 */
	public String toString() {
		return getName();
	}
	
	/**
	 * DataCore objects are compared by both their specific subclass and their uid
	 */
	public boolean equals(Object obj) {
		if(this.getClass() != obj.getClass()) {
			return false;
		}
		DataCore dc = (DataCore) obj;
		if(id == dc.getID()) {
			return true;
		}
		return false;
	}
	
	/**
	 * DataCore hash codes are merely their uid
	 */
	public int hashCode() {
		return id;
	}
	
	//Allows sub-classes to identify their main db table
	protected abstract String getTable();
	
	//Pulls a single row from the relevant table by its id and returns the ResultSet, for constructors etc.
	protected ResultSet getByID() throws SQLException {
		getByIDStatements.fetch(getTable()).setInt(1, id);
		return getByIDStatements.fetch(getTable()).executeQuery();
	}
		
	//As above, but by name - only useful in constructors when that is unique!
	protected ResultSet getByName() throws SQLException {
		getByNameStatements.fetch(getTable()).setString(1, name);
		return getByNameStatements.fetch(getTable()).executeQuery();
	}
	
	//Class for creating and holding PreparedStatements generated from templates
	//to allow sub-classes to at more elegantly
	protected static class Statements extends HashMap<String, PreparedStatement> { //No serialVersionUID, but probably doesn't need to be serialised
		protected String template;
		public Statements(String template) {
			super();
			this.template = template;
		}
		public PreparedStatement fetch(String... tables) throws SQLException {
			if(!containsKey(tables[0])) {
				String sql = template;
				for(int x=0; x < tables.length; x++) {
					sql = sql.replaceAll("<t"+x+">", tables[x]);
				}
				put(tables[0], Library.getDB().prepareStatement(sql));
			}
			return get(tables[0]);
		}
	}
	
	protected static Statements getByIDStatements = new Statements("SELECT * FROM <t0> WHERE id = ?;");
	protected static Statements getByNameStatements = new Statements("SELECT * FROM <t0> WHERE name = ?;");
}
